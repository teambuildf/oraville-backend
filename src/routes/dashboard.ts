import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getDashboard } from '../controllers/dashboardController';

const router = Router();

// Dashboard requires authentication
router.use(authMiddleware);

router.get('/', getDashboard);

export default router;
