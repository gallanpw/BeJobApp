import { Router } from 'express';
import { createJob, getAllJobs, getJobById, updateJob, deleteJob, getJobsByOwner, getJobOwnerDetail } from '../../../controllers/jobController';
import { protect } from '../../../middlewares/auth';

const router = Router();

router.get('/api/v1/jobs/user', protect, getJobsByOwner);           // list by owner
router.get('/api/v1/jobs/user/:id', protect, getJobOwnerDetail);    // detail job by owner
router.post('/api/v1/jobs', protect, createJob);                    // create
router.put('/api/v1/jobs/:id', protect, updateJob);                 // update
router.delete('/api/v1/jobs/:id',protect, deleteJob);               // delete
router.get('/api/v1/jobs',      getAllJobs);                        // list all job
router.get('/api/v1/jobs/:id',  getJobById);                        // detail job

export default router;
