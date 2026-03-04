import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// CORS headers for cross-origin requests from hellolexa.space
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://hellolexa.space',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Handle CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Initialize leads table on first request
async function initLeadsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      source VARCHAR(100) DEFAULT 'landing_page',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// POST - Add new lead
export async function POST(request: NextRequest) {
  try {
    await initLeadsTable();
    
    const body = await request.json();
    const { email, source = 'landing_page' } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Insert lead (ignore duplicates)
    const result = await query(
      `INSERT INTO leads (email, source) 
       VALUES ($1, $2) 
       ON CONFLICT (email) DO NOTHING
       RETURNING id, email, source, created_at`,
      [email.toLowerCase().trim(), source]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: 'Email already registered', alreadyExists: true },
        { status: 200, headers: corsHeaders }
      );
    }

    console.log('✅ New lead captured:', email);
    
    return NextResponse.json(
      { 
        message: 'Successfully registered!', 
        lead: result.rows[0],
        alreadyExists: false 
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Lead capture error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// GET - List leads (for admin purposes)
export async function GET() {
  try {
    const result = await query(
      'SELECT * FROM leads ORDER BY created_at DESC LIMIT 100'
    );
    return NextResponse.json(
      { leads: result.rows, count: result.rows.length },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
