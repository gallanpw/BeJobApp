import { RequestHandler } from 'express';
import ApplyJob from '../models/ApplyJob';
import Job from '../models/Job';
import User from '../models/User';

export const createApplyJob: RequestHandler = async (req, res) => {
    try {
        const { job, fullname, resumeUrl, contactPhone } = req.body;
    
        // 1️⃣ validasi job ada & belum di-soft delete
        const jobDoc = await Job.findOne({ _id: job, isDeleted: false });
        if (!jobDoc) {
            res.status(404).json({ message: 'Job tidak ditemukan' });
            return;
        }

        // 2️⃣ owner tidak boleh apply sendiri
        if (jobDoc.owner.toString() === req.user!.id) {
            res.status(400).json({ message: 'Owner tidak boleh apply job sendiri' });
            return;
        }
    
        // 3️⃣ cek duplicate lamaran
        const duplicate = await ApplyJob.findOne({ user: req.user!.id, job });
        if (duplicate) { 
            res.status(400).json({ message: 'Anda sudah melamar job ini' });
            return;
        }
    
        // 4️⃣ buat dokumen ApplyJob
        const applyjob = await ApplyJob.create({ user: req.user!.id, job, fullname, resumeUrl, contactPhone });
    
        // 5️⃣ increment counter pada User.jobApply
        await User.updateOne({ _id: req.user!.id }, { $inc: { jobApply: 1 } });
    
        // 6️⃣ kirim response
        res.status(201).json({ message: 'Berhasil buat Apply Job', applyjob });
    } catch (err) {
        res.status(500).json({ message: (err as Error).message });
    }
};
  