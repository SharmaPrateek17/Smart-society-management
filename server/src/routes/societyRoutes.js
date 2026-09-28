import { Router } from 'express';
import { listSocieties, getSociety, createSociety, inviteResident } from '../controllers/societyController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, listSocieties);
router.get('/:id', authenticateToken, getSociety);
router.post('/', authenticateToken, authorizeRoles('SUPER_ADMIN'), createSociety);
router.post('/:id/invite-resident', authenticateToken, authorizeRoles('ADMIN', 'SUPER_ADMIN'), inviteResident);

export default router;
