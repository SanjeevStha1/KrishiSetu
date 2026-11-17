import { Request, Response, NextFunction } from 'express';
import { authStore } from '../services/authStore';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: any;
  profile?: any;
  farm?: any;
}

export function getBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.split(' ')[1] || null;
}

/**
 * Optional authentication: extracts session if token provided, but doesn't block unauthenticated requests.
 */
export async function optionalAuthMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const token = getBearerToken(req);
    if (token) {
      const session = await authStore.validateSessionAsync(token);
      if (session.isValid && session.user) {
        req.userId = session.user.id;
        req.user = session.user;
        req.profile = session.profile;
        req.farm = session.farm;
      }
    }
  } catch {
    // non-fatal for optional auth
  }
  next();
}

/**
 * Strict authentication: rejects requests without a valid session token.
 */
export async function requireAuthMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ success: false, error: 'Authentication token is required' });
    }

    const session = await authStore.validateSessionAsync(token);
    if (!session.isValid || !session.user) {
      return res.status(401).json({ success: false, error: 'Session has expired or is invalid. Please sign in again.' });
    }

    req.userId = session.user.id;
    req.user = session.user;
    req.profile = session.profile;
    req.farm = session.farm;
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Invalid authentication session' });
  }
}
