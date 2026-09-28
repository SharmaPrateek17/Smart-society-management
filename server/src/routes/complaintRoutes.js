import { Router } from 'express';
import { createComplaint, listComplaints, updateComplaintStatus } from '../controllers/complaintController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticateToken, authorizeRoles('RESIDENT', 'ADMIN'), createComplaint);
router.get('/', authenticateToken, listComplaints);
router.patch('/:id/status', authenticateToken, authorizeRoles('ADMIN', 'SUPER_ADMIN'), updateComplaintStatus);

export default router;
