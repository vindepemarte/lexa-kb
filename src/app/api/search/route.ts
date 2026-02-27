import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { query: searchQuery, paraCategory } = body;

    if (!searchQuery) {
      return NextResponse.json({ error: 'Query required' }, { status: 400 });
    }

    // Full-text search with PostgreSQL
    let sql = `
      SELECT id, title, para_category, file_type, created_at,
             ts_headline(content, plainto_tsquery($1)) as highlight
      FROM documents
      WHERE user_id = $2
        AND content IS NOT NULL
        AND content != ''
    `;
    const params: any[] = [searchQuery, user.id];
    let paramCount = 2;

    if (paraCategory) {
      paramCount++;
      sql += ` AND para_category = $${paramCount}`;
      params.push(paraCategory);
    }

    sql += `
      AND (
        to_tsvector('english', content) @@ plainto_tsquery($1)
        OR title ILIKE '%' || $1 || '%'
      )
      ORDER BY 
        ts_rank(to_tsvector('english', content), plainto_tsquery($1)) DESC,
        created_at DESC
      LIMIT 50
    `;

    const result = await query(sql, params);

    return NextResponse.json({
      results: result.rows,
      query: searchQuery,
      count: result.rowCount,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
