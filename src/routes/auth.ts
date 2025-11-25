import { Router } from 'express';
import { authenticateTelegram } from '../controllers/authController';

const router = Router();

router.post('/telegram', authenticateTelegram);

export default router;
