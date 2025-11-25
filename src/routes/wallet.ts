import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getTransactions, getReferrals } from '../controllers/walletController';

const router = Router();

// All wallet routes require authentication
router.use(authMiddleware);

router.get('/transactions', getTransactions);
router.get('/referrals', getReferrals);

export default router;
