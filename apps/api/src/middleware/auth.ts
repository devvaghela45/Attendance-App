import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

type JwtPayload = { userId: string; role: 'EMPLOYER' | 'EMPLOYEE'; companyId?: string; employeeId?: string };

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    req.user = jwt.verify(token, env.jwtSecret) as JwtPayload;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const requireRole = (role: 'EMPLOYER' | 'EMPLOYEE') => (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== role) return res.status(403).json({ message: 'Forbidden' });
  next();
};
