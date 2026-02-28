import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/subscription-middleware';
import { TierName } from '@/lib/subscription';

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

    // Get user tier for result limits
    const currentUser = await getCurrentUser(request);
    const tier: TierName = (currentUser?.tier || 'free') as TierName;
    const isFree = tier === 'free';
    const resultLimit = isFree ? 3 : 50;

    const body = await request.json();
    const { query: searchQuery, paraCategory } = body;

    if (!searchQuery) {
      return NextResponse.json({ error: 'Query required' }, { status: 400 });
    }

    // First get total count of matches
    let countSql = `
      SELECT COUNT(*) as total
      FROM documents
      WHERE user_id = $2
        AND content IS NOT NULL
        AND content != ''
        AND (
          to_tsvector('english', content) @@ plainto_tsquery($1)
          OR title ILIKE '%' || $1 || '%'
        )
    `;
    const countParams: unknown[] = [searchQuery, user.id];

    if (paraCategory) {
      countSql += ` AND para_category = $3`;
      countParams.push(paraCategory);
    }

    const countResult = await query(countSql, countParams);
    const totalCount = parseInt(countResult.rows[0].total);

    // Now get actual results with limit
    let sql = `
      SELECT id, title, para_category, file_type, created_at,
             ts_headline(content, plainto_tsquery($1)) as highlight
      FROM documents
      WHERE user_id = $2
        AND content IS NOT NULL
        AND content != ''
    `;
    const params: unknown[] = [searchQuery, user.id];
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
      LIMIT ${resultLimit}
    `;

    const result = await query(sql, params);

    return NextResponse.json({
      results: result.rows,
      query: searchQuery,
      count: result.rowCount,
      totalCount,
      limited: isFree && totalCount > resultLimit,
      tier,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
