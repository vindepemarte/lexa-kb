import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

export async function query(text: string, params?: unknown[]) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text: text.substring(0, 50), duration, rows: result.rowCount });
  return result;
}

export async function initDB() {
  try {
    // Enable required extensions
    await query(`CREATE EXTENSION IF NOT EXISTS vector;`);
    await query(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
    console.log('✅ pgvector + pg_trgm extensions enabled');

    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        tier VARCHAR(50) DEFAULT 'free',
        subscription_status VARCHAR(50) DEFAULT 'active',
        stripe_customer_id VARCHAR(255),
        stripe_subscription_id VARCHAR(255),
        subscription_current_period_end TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add new subscription columns if they don't exist
    try {
      await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'active';`);
      await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255);`);
      await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMP;`);
      console.log('✅ Subscription columns added');
    } catch {
      console.log('⚠️ Subscription columns may already exist');
    }

    // Create documents table
    await query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(500) NOT NULL,
        content TEXT,
        para_category VARCHAR(50) DEFAULT 'resources',
        file_path TEXT,
        file_type VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Try to add embedding column if pgvector is available
    try {
      await query(`ALTER TABLE documents ADD COLUMN IF NOT EXISTS embedding VECTOR(384);`);
      console.log('✅ Vector column added for embeddings');
    } catch {
      console.log('⚠️ Vector column not added (pgvector may not be fully configured)');
    }

    // Add summary column for AI-generated summaries
    try {
      await query(`ALTER TABLE documents ADD COLUMN IF NOT EXISTS summary TEXT;`);
      console.log('✅ Summary column added');
    } catch {
      console.log('⚠️ Summary column may already exist');
    }

    // Search-performance indexes (P0: search API latency)
    // Helps: to_tsvector/plainto_tsquery ranking and title ILIKE fallback
    await query(`
      CREATE INDEX IF NOT EXISTS idx_documents_search_vector
      ON documents USING GIN (to_tsvector('english', coalesce(content, '')));
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_documents_title_trgm
      ON documents USING GIN (title gin_trgm_ops);
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_documents_user_created_at
      ON documents (user_id, created_at DESC);
    `);
    console.log('✅ Search indexes ensured');

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

export default pool;
