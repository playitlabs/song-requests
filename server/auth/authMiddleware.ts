import jwt from 'jsonwebtoken';
import { getJwtSecret } from './authController';
import { Request, Response, NextFunction } from 'express';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authorization header missing or invalid' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    jwt.verify(token, getJwtSecret());
    next();
  } catch (error) {
    res.status(403).json({ message: 'Token expired or invalid' });
  }
};  