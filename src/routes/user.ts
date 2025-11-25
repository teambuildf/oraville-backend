import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { profileValidation, handleValidationErrors } from '../middleware/validation';
import { getProfile, updateProfile, getAvatarUploadUrl, confirmAvatar } from '../controllers/userController';

const router = Router();

// All user routes require authentication
router.use(authMiddleware);

router.get('/profile', getProfile);
router.put('/profile', profileValidation, handleValidationErrors, updateProfile);
router.get('/avatar/upload-url', getAvatarUploadUrl);
router.post('/avatar/confirm', confirmAvatar);

export default router;
