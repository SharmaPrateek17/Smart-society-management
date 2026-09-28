import { Router } from 'express';
import { createRequest, listRequests, getRequest, updateRequestStatus } from '../controllers/requestController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticateToken, authorizeRoles('RESIDENT', 'ADMIN'), createRequest);
router.get('/', authenticateToken, listRequests);
router.get('/:id', authenticateToken, getRequest);
router.patch('/:id/status', authenticateToken, updateRequestStatus);

export default router;
