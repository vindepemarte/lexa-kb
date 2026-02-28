import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: Request) {
  try {
    const { email, tier } = await request.json();
    
    if (!email || !tier) {
      return NextResponse.json({ error: 'Email and tier required' }, { status: 400 });
    }

    const result = await pool.query(
      'UPDATE users SET tier = $1 WHERE email = $2 RETURNING id, email, tier',
      [tier, email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
