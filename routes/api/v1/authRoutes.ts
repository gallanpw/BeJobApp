import { Router } from 'express';
import { register, login, getMe } from '../../../controllers/authController';
import { protect } from '../../../middlewares/auth';

const router = Router();

router.post('/api/v1/auth/register', register);
router.post('/api/v1/auth/login', login);
router.get('/api/v1/auth/get-user', protect, getMe);

export default router;
