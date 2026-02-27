import { Pool } from 'pg';
import * as pdfParse from 'pdf-parse';
import { readFile } from 'fs/promises';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function reprocessDocuments() {
  try {
    // Get all documents with empty content but file paths
    const result = await pool.query(
      'SELECT id, title, file_path, file_type FROM documents WHERE (content IS NULL OR content = \'\') AND file_path IS NOT NULL'
    );

    console.log(`Found ${result.rows.length} documents to reprocess`);

    for (const doc of result.rows) {
      try {
        console.log(`Processing: ${doc.title} (${doc.file_type})`);

        if (doc.file_type === 'application/pdf' || doc.file_path.endsWith('.pdf')) {
          const buffer = await readFile(doc.file_path);
          const pdfData = await (pdfParse as any).default(buffer);
          const content = pdfData.text;

          await pool.query(
            'UPDATE documents SET content = $1 WHERE id = $2',
            [content, doc.id]
          );

          console.log(`✓ Updated ${doc.title} (${content.length} chars)`);
        } else {
          console.log(`⊘ Skipping ${doc.title} (not a PDF)`);
        }
      } catch (err) {
        console.error(`✗ Error processing ${doc.title}:`, err.message);
      }
    }

    console.log('\nDone!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

reprocessDocuments();
