import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../controllers/notificationController.js';

const router = express.Router();

router.use(protect); // Secure all notification routes

router.get('/', getNotifications);
router.put('/mark-all-read', markAllNotificationsAsRead);
router.put('/:id', markNotificationAsRead);

export default router;
