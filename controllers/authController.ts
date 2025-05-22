import { RequestHandler } from 'express';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import Job from '../models/Job';
import ApplyJob from '../models/ApplyJob';

/** helper membuat JWT  */
const signToken = (id: string) => {
    const secret: Secret = process.env.JWT_SECRET || 'defaultSecret';
    const expiresIn = (process.env.JWT_EXPIRES || '1h') as SignOptions['expiresIn'];
  
    return jwt.sign({ id }, secret, { expiresIn });
};

// -------- Register --------
export const register: RequestHandler = async (req, res) => {
  const { name, email, password } = req.body as {
    name: string; email: string; password: string;
  };

  try {
    const exists = await User.findOne({ email });
    if (exists) {
      res.status(400).json({ message: 'Email sudah terpakai' });
      return;
    }

    const user = await User.create({ name, email, password });
    res.status(201).json({
      message: 'Register Berhasil',
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};

// -------- Login --------
export const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ message: 'Email / password salah' });
      return;
    }

    const token = signToken(user.id);
    res.json({
      user: { id: user.id, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};

// -------- GET /user --------
export const getMe: RequestHandler = async (req, res) => {
    // @ts-ignore (req.user dipasang di middleware)
    const user = req.user as IUser;
    // const userId = (req.user as IUser).id;

    // ambil ulang user, cuma butuh jobApply (dan id,name,email)
    // const fresh = await User.findById(userId)
    //     .select('name email jobApply')
    //     .lean();

    // if (!fresh) {
    //     res.status(404).json({ message: 'User tidak ditemukan' });
    //     return;
    // }

    // 1️⃣ ambil semua job yang saya punya (hanya _id)
    const ownedJobs = await Job.find({ owner: user.id })
        .select('_id')
        .lean();

    const ownedJobIds = ownedJobs.map(j => j._id);

    // hitung fresh semua lamaran user ini
    const count = await ApplyJob.countDocuments({ job: { $in: ownedJobIds } });

    res.json({
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            // jobApply: user.jobApply,
            jobApply: count,
        },
    });
};
