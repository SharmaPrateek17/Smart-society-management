import { Router } from 'express';
import { submitQuotation, getQuotationsForPool } from '../controllers/quotationController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticateToken, authorizeRoles('VENDOR'), submitQuotation);
router.get('/pool/:poolId', authenticateToken, getQuotationsForPool);

export default router;
