import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { getAdminAnalytics, getAllUsers, toggleUserBan, getDisputes } from '../controllers/adminController.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin')); // Lock all routes under this file to admin only

router.get('/analytics', getAdminAnalytics);
router.get('/users', getAllUsers);
router.put('/users/:id/ban', toggleUserBan);
router.get('/reports', getDisputes);

export default router;
