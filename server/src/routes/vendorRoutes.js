import { Router } from 'express';
import {
  listVendors,
  getMyVendorProfile,
  updateVendorProfile,
  getMyInvitations,
  getMyAssignedJobs,
  verifyVendor
} from '../controllers/vendorController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, listVendors);
router.get('/profile/me', authenticateToken, authorizeRoles('VENDOR'), getMyVendorProfile);
router.put('/profile/me', authenticateToken, authorizeRoles('VENDOR'), updateVendorProfile);
router.get('/invitations/me', authenticateToken, authorizeRoles('VENDOR'), getMyInvitations);
router.get('/jobs/me', authenticateToken, authorizeRoles('VENDOR'), getMyAssignedJobs);
router.patch('/:id/verify', authenticateToken, authorizeRoles('SUPER_ADMIN'), verifyVendor);

export default router;
