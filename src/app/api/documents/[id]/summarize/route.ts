import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';
import { checkFeatureAccess } from '@/lib/subscription-middleware';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user has access to AI features (Pro+)
    const accessCheck = await checkFeatureAccess(request, 'chat');

    if (!accessCheck.allowed) {
      return NextResponse.json(
        {
          error: accessCheck.error,
          requiresUpgrade: true,
          upgradePrompt: accessCheck.upgradePrompt,
        },
        { status: 403 }
      );
    }

    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { id } = await params;

    // Get the document
    const docResult = await query(
      'SELECT id, title, content, summary FROM documents WHERE id = $1 AND user_id = $2',
      [id, user.id]
    );

    if (docResult.rows.length === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const doc = docResult.rows[0];

    // Return cached summary if exists
    if (doc.summary) {
      return NextResponse.json({ summary: doc.summary, cached: true });
    }

    // Check if document has content to summarize
    if (!doc.content || doc.content.trim().length < 50) {
      return NextResponse.json({ 
        error: 'Document is too short to summarize (minimum 50 characters)' 
      }, { status: 400 });
    }

    // Truncate content if too long (to save tokens)
    const maxContentLength = 8000;
    const contentToSummarize = doc.content.length > maxContentLength
      ? doc.content.substring(0, maxContentLength) + '...'
      : doc.content;

    // Call OpenRouter API for summarization
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://app.hellolexa.space',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.2-3b-instruct:free',
        messages: [
          {
            role: 'system',
            content: `You are an expert at summarizing documents. Create a clear, concise summary that captures:
1. The main topic/subject
2. Key points and insights
3. Important details or conclusions

Format your response in clean markdown with bullet points where appropriate.
Keep the summary between 100-300 words unless the document is very long.`
          },
          {
            role: 'user',
            content: `Please summarize this document titled "${doc.title}":\n\n${contentToSummarize}`
          }
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter error:', error);
      return NextResponse.json(
        { error: 'Failed to generate summary' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content || 'Unable to generate summary.';

    // Cache the summary in the database
    await query(
      'UPDATE documents SET summary = $1 WHERE id = $2',
      [summary, id]
    );

    return NextResponse.json({ summary, cached: false });
  } catch (error) {
    console.error('Summarize error:', error);
    return NextResponse.json(
      { error: 'Failed to summarize document' },
      { status: 500 }
    );
  }
}
