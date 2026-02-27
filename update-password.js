const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: 'postgres://postgres:xw19ng47pvxzKOa003eck6t5bsw76IBDZSFluDmOkS4dRj94AA4wPPMa9k6obZWI@k4swc0g0kw4g0ws0w84coc8g:5432/postgres',
  ssl: false,
});

async function updatePassword() {
  const newPassword = 'lexa2026';
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  const result = await pool.query(
    'UPDATE users SET password = $1 WHERE email = $2 RETURNING id, email',
    [hashedPassword, 'iacovici95@gmail.com']
  );
  
  if (result.rowCount > 0) {
    console.log('✅ Password updated for:', result.rows[0].email);
    console.log('New password:', newPassword);
  } else {
    console.log('❌ User not found');
  }
  
  await pool.end();
}

updatePassword().catch(console.error);
