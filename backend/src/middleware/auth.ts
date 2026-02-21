import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import type { IUserDocument } from '../models/User.js';

const secret = process.env.JWT_SECRET || 'dev-secret';

interface TokenPayload {
  id: string;
  role: 'applicant' | 'employer';
}

export function signToken(user: IUserDocument): string {
  return jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: '7d' });
}

export function authRequired(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  try {
    const payload = jwt.verify(header.slice(7), secret) as TokenPayload;
    req.userId = payload.id;
    req.userRole = payload.role;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function employerOnly(req: Request, res: Response, next: NextFunction): void {
  if (req.userRole !== 'employer') {
    res.status(403).json({ error: 'Employer access only' });
    return;
  }
  next();
}
