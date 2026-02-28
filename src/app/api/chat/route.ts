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

    // Fetch user's documents to provide context
    const documentsResult = await query(
      'SELECT title, content, para_category, file_type FROM documents WHERE user_id = $1 AND content IS NOT NULL AND content != \'\' ORDER BY created_at DESC LIMIT 50',
      [user.id]
    );

    // Build context from documents
    let documentsContext = '';
    if (documentsResult.rows.length > 0) {
      documentsContext = '\n\nUser\'s Documents:\n' + documentsResult.rows.map((doc: { content: string, title: string, para_category: string, file_type: string }, i: number) => {
        const preview = doc.content.substring(0, 1000); // First 1000 chars per doc
        return `${i + 1}. "${doc.title}" (${doc.para_category}, ${doc.file_type}):\n${preview}${doc.content.length > 1000 ? '...' : ''}`;
      }).join('\n\n');
    }

    // Build system prompt with document context
    const systemPrompt = `You are Lexa, a friendly AI assistant who helps users organize and understand their documents. You have access to the user's uploaded documents and can answer questions about them.

${documentsContext ? documentsContext : 'The user has not uploaded any documents yet.'}

When answering:
- If asked about documents, reference specific documents by title
- Provide accurate information based on the document content
- Be helpful, concise, and warm
- Use emojis occasionally 💜
- If you don't know something based on the documents, say so honestly`;

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
