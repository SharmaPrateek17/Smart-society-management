import { Router } from 'express';
import { listDocuments, createDocument } from '../controllers/documentController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, listDocuments);
router.post('/', authenticateToken, authorizeRoles('ADMIN', 'SUPER_ADMIN'), createDocument);

export default router;
