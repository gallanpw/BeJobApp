import { Router } from 'express';
import { createApplyJob } from '../../../controllers/applyJobController';
import { protect } from '../../../middlewares/auth';

const router = Router();

router.post('/api/v1/applyjob', protect, createApplyJob);

export default router;
