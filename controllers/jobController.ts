import { RequestHandler } from 'express';
import Job, { IJob } from '../models/Job';
import Category from '../models/Category';
import ApplyJob from '../models/ApplyJob';
import { Types } from 'mongoose';

interface CreateJobBody
  extends Omit<IJob,
    '_id' | 'owner' | 'isDeleted' | 'createdAt' | 'updatedAt'> {}

/** POST /api/v1/jobs  */
export const createJob: RequestHandler = async (req, res) => {
  try {
    const {
        title, description, remote, salary, jobType, requirements, benefits, city, address, phone, category,
    } = req.body as CreateJobBody;

    /* 1️⃣ validasi category id */
    const cat = await Category.findOne({ _id: category, isDeleted: false });
    if (!cat) {
      res.status(404).json({ message: 'Kategori tidak ditemukan' });
      return;
    }

    /* 2️⃣ owner diambil dari req.user */
    const ownerId = req.user!.id; // req.user ditempel oleh middleware protect

    const job = await Job.create({
      title, description, remote, salary,
      jobType, requirements, benefits,
      city, address, phone,
      category,                // ref kategori
      owner: ownerId,          // ref user
    });

    res.status(201).json({
        message: 'Berhasil Buat Pekerjaan Baru',
        newJob: job,
    });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

/* ---------- LIST / INDEX  (GET /api/v1/jobs) ---------- */
export const getAllJobs: RequestHandler = async (_req, res) => {
    try {
      const jobs = await Job.find({ isDeleted: false })       // abaikan job ter-soft-delete
        .populate({ path: 'category', select: 'name' })       // hanya _id & name
        .lean();                                              // objek JS plain → mudah dikirim
  
      res.json({
        message: 'Tampil list pekerjaan',
        jobs,
      });
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
};

/* ---------- DETAIL  (GET /api/v1/jobs/:id) ---------- */
export const getJobById: RequestHandler = async (req, res) => {
    try {
      const job = await Job.findOne({
        _id: req.params.id,
        isDeleted: false,          // abaikan yang soft-delete
      })
        .populate({ path: 'category', select: 'name' }) // { _id, name }
        .populate({ path: 'owner',    select: 'name email __v' }) // { _id, name, email }
        .lean();
  
      if (!job) {
        res.status(404).json({ message: 'Job tidak ditemukan' });
        return;
      }
  
      res.json({
        message: 'Detail Pekerjaan',
        job,
      });
    } catch (err) {
      res.status(400).json({ message: 'ID tidak valid' });
    }
};
  
/* ---------- UPDATE  (PUT /api/v1/job/:id) ---------- */
export const updateJob: RequestHandler = async (req, res) => {
    try {
      /* 1️⃣  cari job */
      const job = await Job.findOne({ _id: req.params.id, isDeleted: false });
      if (!job) {
        res.status(404).json({ message: 'Job tidak ditemukan' });
        return;
      }
  
      /* 2️⃣  pastikan pemilik */
      if (job.owner.toString() !== req.user!.id) {
        res.status(403).json({ message: 'Anda bukan pemilik job ini' });
        return;
      }
  
      /* 3️⃣  validasi kategori baru (jika dikirim) */
      if (req.body.category && req.body.category !== job.category.toString()) {
        const cat = await Category.findOne({ _id: req.body.category, isDeleted: false });
        if (!cat) {
          res.status(404).json({ message: 'Kategori baru tidak ditemukan' });
          return;
        }
        job.category = cat._id as Types.ObjectId;
      }
  
      /* 4️⃣  perbarui kolom lain (hanya yang dikirim) */
      const updatable = [
        'title','description','remote','salary','jobType',
        'requirements','benefits','city','address','phone'
      ] as const;
  
      updatable.forEach(f => {
        if (req.body[f] !== undefined) (job as any)[f] = req.body[f];
      });
  
      const updated = await job.save();
  
      res.json({
        message: 'Job berhasil diupdate',
        job: updated,
      });
    } catch (err) {
      res.status(400).json({ message: (err as Error).message });
    }
};

/* ---------- LIST J0B MILIK USER LOGIN ---------- */
export const getJobsByOwner: RequestHandler = async (req, res) => {
    try {
        // const requestedId = req.params.id;      // id di URL
        const ownerId = req.user!.id;           // dipasang middleware protect

        // Jika bukan admin & meminta data orang lain ⇒ Forbidden
        // if (requestedId !== ownerId /* && !req.user!.role === 'admin' */) {
        //     res.status(403).json({ message: 'Anda tidak berhak melihat job user ini' });
        //     return;
        // }
    
        const jobs = await Job.find({
            owner: ownerId,
            isDeleted: false,
        }).lean();                              // tidak populate, agar format sama dgn requirement
    
        res.json({
            message: 'List Job Owner',
            job: jobs,                          // array sesuai contoh
        });
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
};

export const getJobOwnerDetail: RequestHandler = async (req, res) => {
    try {
        const job = await Job.findOne({ _id: req.params.id, owner: req.user!.id, isDeleted:false }).lean();
        if (!job) {
            res.status(404).json({ message: 'Job tidak ditemukan / bukan milik Anda' });
            return;
        }
    
        const listApply = await ApplyJob.find({ job: job._id })
            .populate({ path: 'user', select: 'name email' })
            .lean();
    
        res.json({ message: 'Detail Job Owner', job: { ...job, listApply } });
    } catch (err) {
        res.status(400).json({ message: (err as Error).message });
    }
};

export const deleteJob: RequestHandler = async (req, res) => {
    try {
        // 1️⃣ cari job yang masih aktif
        const job = await Job.findOne({ _id: req.params.id, isDeleted: false });
        if (!job) {
            res.status(404).json({ message: 'Job tidak ditemukan' });
            return;
        }

        // 2️⃣ cek owner
        if (job.owner.toString() !== req.user!.id) {
            res.status(403).json({ message: 'Anda bukan pemilik job ini' });
            return;
        }

        // 3️⃣ soft delete
        job.isDeleted = true;
        await job.save();

        res.json({ message: 'Job berhasil dihapus (soft delete)' });
    } catch (err) {
        res.status(400).json({ message: 'ID tidak valid' });
    }
};