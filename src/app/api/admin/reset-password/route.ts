import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    const newPassword = 'lexa2026';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await query(
      'UPDATE users SET password = $1 WHERE email = $2 RETURNING id, email',
      [hashedPassword, 'iacovici95@gmail.com']
    );

    if (result.rowCount && result.rowCount > 0) {
      return NextResponse.json({
        success: true,
        message: 'Password updated',
        email: result.rows[0].email,
        newPassword: newPassword
      });
    } else {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
