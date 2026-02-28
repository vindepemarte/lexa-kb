import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';
import { checkFeatureAccess } from '@/lib/subscription-middleware';

export async function POST(request: NextRequest) {
  try {
    // Check if user has access to chat feature (Pro+)
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

    const body = await request.json();
    const { message, conversationHistory = [] } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    // --- INTELLIGENT CONTEXT RETRIEVAL ---
    // Instead of grabbing all documents, use PostgreSQL full-text search
    // to find the most relevant documents related to the user's specific question.
    const searchParams: unknown[] = [message, user.id];
    const searchSql = `
      SELECT id, title, para_category, content, file_type, 
             ts_rank(to_tsvector('english', coalesce(content, '')), plainto_tsquery($1)) as rank
      FROM documents
      WHERE user_id = $2
        AND content IS NOT NULL
        AND content != ''
      ORDER BY rank DESC, created_at DESC
      LIMIT 10
    `;

    const relevantDocsResult = await query(searchSql, searchParams);
    const relevantDocs = relevantDocsResult.rows;

    let documentsContext = "No relevant documents found in the user's knowledge base.";

    if (relevantDocs.length > 0) {
      documentsContext = relevantDocs.map(doc =>
        `[Document: ${doc.title} | Category: ${doc.para_category} | Type: ${doc.file_type}]\n${doc.content}\n`
      ).join('\n---\n\n');
    }

    // Build system prompt with document context
    const systemPrompt = `You are Lexa, an intelligent, helpful, and concise AI assistant for a personal knowledge base.
You are helping the user based ONLY on the most relevant excerpts retrieved from their documents provided below.

The documents follow the PARA method (Projects, Areas, Resources, Archives).

Relevant Knowledge Base Context:
${documentsContext}

Instructions:
1. Answer the user's question using ONLY the context provided above.
2. If the answer is not in the context, politely inform the user that you couldn't find it in their uploaded documents, but offer a general helpful answer if possible.
3. Keep answers concise, extremely well-formatted (use markdown), and professional.
4. If appropriate, cite the document title you are referencing (e.g., "According to [Document Title]...").
5. Do not invent information about the user's files.`;

    // Call OpenRouter API
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
            content: systemPrompt
          },
          ...conversationHistory,
          { role: 'user', content: message }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter error:', error);
      return NextResponse.json(
        { error: 'Chat failed' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not process that.';

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Chat failed' },
      { status: 500 }
    );
  }
}
