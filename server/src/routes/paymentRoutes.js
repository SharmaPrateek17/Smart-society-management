import { Router } from 'express';
import { createPayment, listPayments, updatePaymentStatus } from '../controllers/paymentController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticateToken, authorizeRoles('ADMIN', 'RESIDENT'), createPayment);
router.get('/', authenticateToken, listPayments);
router.patch('/:id/status', authenticateToken, authorizeRoles('ADMIN', 'SUPER_ADMIN'), updatePaymentStatus);

export default router;
