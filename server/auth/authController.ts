import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

export const getJwtSecret = () => process.env.JWT_SECRET || process.env.PLAYIT_LIVE_API_KEY!;
const jwtExpiry = '24h';

export const login = (req: Request, res: Response) => {
  const { password } = req.body;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedPassword) {
    res.status(500).json({ success: false, message: 'Admin password not set' });
    return;
  }

  if (password === expectedPassword) {
    const token = jwt.sign({ role: 'admin' }, getJwtSecret(), { expiresIn: jwtExpiry });
    
    res.json({
      success: true,
      token
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid password' });
  }
}; 