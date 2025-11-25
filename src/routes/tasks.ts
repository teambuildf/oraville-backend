import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getDailyTasks, completeTaskEndpoint, verifyFaceScan, getCurrentStreak } from '../controllers/tasksController';

const router = Router();

// All task routes require authentication
router.use(authMiddleware);

router.get('/daily', getDailyTasks);
router.post('/:taskId/complete', completeTaskEndpoint);
router.post('/verify/facescan', verifyFaceScan);
router.get('/current-streak', getCurrentStreak);

export default router;
