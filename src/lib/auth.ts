import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export function verifyAdminPassword(password: string): boolean {
  // Support plain text or bcrypt hash
  if (ADMIN_PASSWORD.startsWith('$2')) {
    return bcrypt.compareSync(password, ADMIN_PASSWORD);
  }
  return password === ADMIN_PASSWORD;
}

export function createAdminToken(): string {
  return jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyAdminToken(token: string): boolean {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { role: string };
    return payload.role === 'admin';
  } catch {
    return false;
  }
}
