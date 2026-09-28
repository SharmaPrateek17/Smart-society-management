import { Router } from 'express';
import { createNotice, listNotices } from '../controllers/noticeController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticateToken, authorizeRoles('ADMIN', 'SUPER_ADMIN'), createNotice);
router.get('/', authenticateToken, listNotices);

export default router;
