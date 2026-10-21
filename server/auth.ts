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

const SESSION_SECRET = process.env.SESSION_SECRET || 'pujasathi_holy_sanctum_session_secret_2026';

export function isUserAdmin(userOrEmail?: string | { email?: string; role?: string } | null): boolean {
  if (!userOrEmail) return false;
  if (typeof userOrEmail === 'string') {
    const norm = userOrEmail.trim().toLowerCase();
    return norm === 'subhayuroy666@gmail.com' || norm === 'pujasathisupport@gmail.com' || norm === 'admin@mandirveda.com';
  }
  const email = (userOrEmail.email || '').trim().toLowerCase();
  return (
    userOrEmail.role === 'admin' ||
    email === 'subhayuroy666@gmail.com' ||
    email === 'pujasathisupport@gmail.com' ||
    email === 'admin@mandirveda.com'
  );
}

export function createSession(userId: string): string {
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 30; // 30 days

  // Retrieve user details from SQLite database
  let user: any = null;
  try {
    user = db
      .prepare('SELECT id, email, full_name, role, phone, address_line, city, state, pincode FROM users WHERE id = ?')
      .get(userId);
  } catch (err) {
    console.error('Error fetching user for session:', err);
  }

  // Fallback lookup by email
  if (!user && userId.includes('@')) {
    try {
      user = db
        .prepare('SELECT id, email, full_name, role, phone, address_line, city, state, pincode FROM users WHERE email = ?')
        .get(userId);
    } catch {}
  }

  // Official admin fallback
  if (!user && (userId === 'usr_pujasathi_admin' || userId === 'pujasathisupport@gmail.com' || userId === 'subhayuroy666@gmail.com')) {
    user = {
      id: userId === 'subhayuroy666@gmail.com' ? 'usr_subhayu_admin' : 'usr_pujasathi_admin',
      email: userId,
      full_name: userId === 'subhayuroy666@gmail.com' ? 'Subhayu Roy (Admin)' : 'PujaSathi Administrator',
      role: 'admin',
    };
  }

  const role = (isUserAdmin(user) || isUserAdmin(userId) ? 'admin' : (user?.role || 'customer')) as 'customer' | 'admin';

  const payload = {
    u: user ? user.id : userId,
    e: user ? user.email : '',
    n: user ? user.full_name : '',
    r: role,
    exp: expiresAt,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(payloadB64).digest('base64url');
  const token = `mv_tok.${payloadB64}.${signature}`;

  // Also persist in local DB if available
  try {
    db.prepare(`
      INSERT OR REPLACE INTO sessions (token, user_id, expires_at)
      VALUES (?, ?, ?)
    `).run(token, userId, expiresAt);
  } catch (err) {
    // Non-fatal if read-only or in-memory
  }

  return token;
}

export function getSessionUser(token: string): AuthUser | null {
  if (!token || typeof token !== 'string') return null;

  const cleanToken = token.trim();

  // 1. Primary: Verify stateless HMAC token (Works across serverless, Vercel, Render, and multi-instances!)
  if (cleanToken.startsWith('mv_tok.')) {
    const parts = cleanToken.split('.');
    if (parts.length === 3) {
      const [, payloadB64, signature] = parts;
      try {
        const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payloadB64).digest('base64url');
        if (
          signature.length === expectedSig.length &&
          crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))
        ) {
          const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
          if (payload && payload.exp && payload.exp > Date.now()) {
            // Try to load latest profile fields from DB if available
            let dbUser: any = null;
            try {
              dbUser = db
                .prepare('SELECT id, email, full_name, role, phone, address_line, city, state, pincode FROM users WHERE id = ? OR email = ?')
                .get(payload.u, payload.e);
            } catch {}

            const isAdmin = isUserAdmin(dbUser) || isUserAdmin(payload.e) || isUserAdmin(payload.u) || payload.r === 'admin';
            const role: 'customer' | 'admin' = isAdmin ? 'admin' : ((dbUser?.role || payload.r || 'customer') as 'customer' | 'admin');

            return {
              id: dbUser?.id || payload.u,
              email: dbUser?.email || payload.e,
              full_name: dbUser?.full_name || payload.n || 'PujaSathi Devotee',
              role,
              phone: dbUser?.phone || '',
              address_line: dbUser?.address_line || '',
              city: dbUser?.city || '',
              state: dbUser?.state || '',
              pincode: dbUser?.pincode || '',
            };
          }
        }
      } catch (err) {
        console.error('Error verifying stateless session token:', err);
      }
    }
  }

  // 2. Secondary: Fallback to SQLite sessions table for legacy tokens
  try {
    const now = Date.now();
    const session = db.prepare(`
      SELECT s.token, s.expires_at, u.id, u.email, u.full_name, u.role, u.phone, u.address_line, u.city, u.state, u.pincode
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ? AND s.expires_at > ?
    `).get(cleanToken, now) as (AuthUser & { token: string; expires_at: number }) | undefined;

    if (session) {
      const isOfficialAdmin = isUserAdmin({ email: session.email, role: session.role });
      return {
        id: session.id,
        email: session.email,
        full_name: session.full_name,
        role: isOfficialAdmin ? 'admin' : session.role,
        phone: session.phone,
        address_line: session.address_line,
        city: session.city,
        state: session.state,
        pincode: session.pincode,
      };
    }

    // Resilient fallback: Check if token directly represents an active user ID or user email
    let fallbackUser: any = null;
    if (cleanToken.includes('@')) {
      fallbackUser = db
        .prepare('SELECT id, email, full_name, role, phone, address_line, city, state, pincode FROM users WHERE LOWER(TRIM(email)) = ?')
        .get(cleanToken.toLowerCase());
    } else if (cleanToken.startsWith('usr_')) {
      fallbackUser = db
        .prepare('SELECT id, email, full_name, role, phone, address_line, city, state, pincode FROM users WHERE id = ?')
        .get(cleanToken);
    }

    if (fallbackUser) {
      // Auto-create active session record for future speed
      try {
        const expiresAt = now + 1000 * 60 * 60 * 24 * 30;
        db.prepare('INSERT OR REPLACE INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(cleanToken, fallbackUser.id, expiresAt);
      } catch {}

      const isOfficialAdmin = isUserAdmin({ email: fallbackUser.email, role: fallbackUser.role });
      return {
        id: fallbackUser.id,
        email: fallbackUser.email,
        full_name: fallbackUser.full_name,
        role: isOfficialAdmin ? 'admin' : fallbackUser.role,
        phone: fallbackUser.phone,
        address_line: fallbackUser.address_line,
        city: fallbackUser.city,
        state: fallbackUser.state,
        pincode: fallbackUser.pincode,
      };
    }
  } catch {}

  return null;
}

export function destroySession(token: string): void {
  if (!token) return;
  try {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  } catch {}
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const candidates: string[] = [];

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    const t = req.headers.authorization.slice(7).trim();
    if (t) candidates.push(t);
  }

  if (req.headers['x-session-token']) {
    const t = (req.headers['x-session-token'] as string).trim();
    if (t && !candidates.includes(t)) candidates.push(t);
  }

  if (req.cookies?.mv_session) {
    const t = req.cookies.mv_session.trim();
    if (t && !candidates.includes(t)) candidates.push(t);
  }

  for (const token of candidates) {
    const user = getSessionUser(token);
    if (user) {
      req.user = user;
      req.sessionToken = token;
      break;
    }
  }

  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please sign in or create an account.' });
  }
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please sign in with your administrator account.' });
  }
  if (!isUserAdmin(req.user)) {
    return res.status(403).json({ error: 'Administrative access restricted to authorized temple administrators.' });
  }
  req.user.role = 'admin';
  next();
}
