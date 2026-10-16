import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db } from './db.js';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: 'customer' | 'admin';
  phone?: string;
  address_line?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
  sessionToken?: string;
}

export function createSession(userId: string): string {
  const token = 'mv_sess_' + crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 14; // 14 days

  db.prepare(`
    INSERT INTO sessions (token, user_id, expires_at)
    VALUES (?, ?, ?)
  `).run(token, userId, expiresAt);

  return token;
}

export function getSessionUser(token: string): AuthUser | null {
  if (!token) return null;

  const now = Date.now();
  const session = db.prepare(`
    SELECT s.token, s.expires_at, u.id, u.email, u.full_name, u.role, u.phone, u.address_line, u.city, u.state, u.pincode
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ? AND s.expires_at > ?
  `).get(token, now) as (AuthUser & { token: string; expires_at: number }) | undefined;

  if (!session) return null;

  return {
    id: session.id,
    email: session.email,
    full_name: session.full_name,
    role: session.role,
    phone: session.phone,
    address_line: session.address_line,
    city: session.city,
    state: session.state,
    pincode: session.pincode,
  };
}

export function destroySession(token: string): void {
  if (!token) return;
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token = req.cookies?.mv_session;
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    const user = getSessionUser(token);
    if (user) {
      req.user = user;
      req.sessionToken = token;
    }
  }

  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrative access restricted' });
  }
  next();
}
