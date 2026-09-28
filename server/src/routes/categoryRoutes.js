import { Router } from 'express';
import { listCategories, createCategory } from '../controllers/categoryController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.get('/', listCategories);
router.post('/', authenticateToken, authorizeRoles('SUPER_ADMIN'), createCategory);

export default router;
