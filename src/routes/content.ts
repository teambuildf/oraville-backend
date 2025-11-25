import { Router } from 'express';
import { getFAQ } from '../controllers/contentController';

const router = Router();

// Content routes don't require authentication
router.get('/faq', getFAQ);

export default router;
