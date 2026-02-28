import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';
import { checkUploadLimit } from '@/lib/subscription-middleware';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import PDFParser from 'pdf2json';
import { getCurrentUser } from '@/lib/subscription-middleware';
import { canPerformAction, TierName } from '@/lib/subscription';

export async function POST(request: NextRequest) {
  try {
    // Parse multipart form FIRST to get file size
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const paraCategory = formData.get('paraCategory') as string || 'resources';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check upload limits BEFORE processing
    const fileSizeBytes = file.size;
    const uploadCheck = await checkUploadLimit(request, fileSizeBytes);

    if (!uploadCheck.allowed) {
      return NextResponse.json(
        {
          error: uploadCheck.error,
          requiresUpgrade: true,
        },
        { status: 403 }
      );
    }

    // Verify auth
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Create upload directory
    const uploadDir = process.env.UPLOAD_DIR || '/data/uploads';
    await mkdir(uploadDir, { recursive: true });

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // Extract text content based on file type
    let content = '';

    // Check if user has PDF extraction access
    const currentUser = await getCurrentUser(request);
    const userTier = (currentUser?.tier || 'free') as TierName;
    const hasPdfAccess = canPerformAction(userTier, 'pdfExtraction');

    try {
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        if (!hasPdfAccess) {
          // Free tier: store file but don't extract text
          content = `[PDF uploaded: ${file.name}]\n\nPDF text extraction requires a Personal plan (€9/mo) or higher.\nUpgrade to unlock full-text search and AI chat across your PDF documents.`;
        } else {
          // Personal+ tier: extract text from PDF

          content = await new Promise<string>((resolve, reject) => {
            const pdfParser = new (PDFParser as typeof PDFParser)(null, true);

            pdfParser.on('pdfParser_dataError', (errData: Error | { parserError: Error }) => {
              const error = errData instanceof Error ? errData : errData.parserError;
              console.error('PDF parse error:', error);
              reject(new Error('PDF parse failed'));
            });

            pdfParser.on('pdfParser_dataReady', (pdfData: { Pages: { Texts: { R: { T: string }[] }[] }[] }) => {
              try {
                // Extract text from all pages
                const text = pdfData.Pages.map((page: { Texts: { R: { T: string }[] }[] }) => {
                  return page.Texts.map((text: { R: { T: string }[] }) => {
                    return decodeURIComponent(text.R[0].T);
                  }).join(' ');
                }).join('\n');

                resolve(text);
              } catch (err) {
                reject(err);
              }
            });

            // Parse from buffer
            pdfParser.parseBuffer(buffer);
          });

          console.log('Extracted PDF text length:', content.length);
        }
      } else if (file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
        // Plain text files
        content = buffer.toString('utf-8');
      } else {
        // For other file types, try to extract as text
        try {
          content = buffer.toString('utf-8');
        } catch {
          content = `[Binary file: ${file.name}]`;
        }
      }
    } catch (extractError) {
      console.error('Error extracting text:', extractError);
      content = `[Could not extract text from ${file.name}]`;
    }

    // Save to database
    const result = await query(
      `INSERT INTO documents (user_id, title, content, para_category, file_path, file_type)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, title, para_category, created_at`,
      [user.id, title || file.name, content, paraCategory, filePath, file.type]
    );

    return NextResponse.json({
      message: 'File uploaded successfully',
      document: result.rows[0],
      contentExtracted: content.length > 0,
      contentLength: content.length,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify auth
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user documents
    const result = await query(
      'SELECT id, title, para_category, file_type, created_at FROM documents WHERE user_id = $1 ORDER BY created_at DESC',
      [user.id]
    );

    return NextResponse.json({
      documents: result.rows,
    });
  } catch (error) {
    console.error('Get documents error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
