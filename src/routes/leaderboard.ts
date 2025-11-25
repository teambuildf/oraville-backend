import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getWeeklyReferralLeaderboard, getAmbassadorsLeaderboard } from '../controllers/leaderboardController';

const router = Router();

// All leaderboard routes require authentication
router.use(authMiddleware);

router.get('/referrals/weekly', getWeeklyReferralLeaderboard);
router.get('/ambassadors', getAmbassadorsLeaderboard);

export default router;
