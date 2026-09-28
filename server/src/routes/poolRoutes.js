import { Router } from 'express';
import { listPools, getPool, inviteVendors, selectVendor } from '../controllers/poolController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, listPools);
router.get('/:id', authenticateToken, getPool);
router.post('/:id/invite-vendors', authenticateToken, authorizeRoles('ADMIN', 'SUPER_ADMIN'), inviteVendors);
router.post('/:id/select-vendor', authenticateToken, authorizeRoles('ADMIN', 'SUPER_ADMIN'), selectVendor);

export default router;
