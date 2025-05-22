import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

interface JwtPayload { id: string }

export const protect: RequestHandler = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Token tidak ada' });
      return;
    }

    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    // fetch user & attach ke req
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.status(401).json({ message: 'User tidak ditemukan' });
      return;
    }

    // @ts-ignore – tambahkan tipe di Declaration Merge jika mau rapi
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Token tidak valid / kedaluwarsa' });
  }
};
