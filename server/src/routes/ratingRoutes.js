import { Router } from 'express';
import { submitRating, getVendorRatings } from '../controllers/ratingController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticateToken, authorizeRoles('RESIDENT'), submitRating);
router.get('/vendor/:vendorId', authenticateToken, getVendorRatings);

export default router;
