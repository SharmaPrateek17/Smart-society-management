import { Router } from 'express';
import { getDashboardStats } from '../controllers/statsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/dashboard', authenticateToken, getDashboardStats);

export default router;
