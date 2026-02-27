import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

export interface User {
  id: number;
  email: string;
  name?: string;
  tier: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: User): string {
  return jwt.sign(
    { id: user.id, email: user.email, tier: user.tier },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): User | null {
  try {
    return jwt.verify(token, JWT_SECRET) as User;
  } catch {
    return null;
  }
}

export async function getUserById(id: number): Promise<User | null> {
  const result = await query('SELECT id, email, name, tier FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await query('SELECT id, email, name, tier FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
}

export async function createUser(email: string, password: string, name?: string): Promise<User> {
  const hashedPassword = await hashPassword(password);
  const result = await query(
    'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name, tier',
    [email, hashedPassword, name || null]
  );
  return result.rows[0];
}

export async function authenticateUser(email: string, password: string): Promise<{ user: User; token: string } | null> {
  const result = await query('SELECT id, email, password, name, tier FROM users WHERE email = $1', [email]);
  const user = result.rows[0];

  if (!user) return null;

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) return null;

  const token = generateToken({ id: user.id, email: user.email, tier: user.tier });
  return {
    user: { id: user.id, email: user.email, name: user.name, tier: user.tier },
    token
  };
}
