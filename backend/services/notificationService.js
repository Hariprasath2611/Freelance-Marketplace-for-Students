import Notification from '../models/Notification.js';
import { getIO } from '../sockets/socketHandler.js';

/**
 * Creates a notification in the database and dispatches it in real-time if the user is online.
 */
export const createNotification = async (userId, title, description, type) => {
  try {
    const notification = await Notification.create({
      userId,
      title,
      description,
      type: type || 'system',
      isRead: false
    });

    // Send real-time notification via Socket.io if initialized
    const io = getIO();
    if (io) {
      io.to(userId.toString()).emit('notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error.message);
  }
};
export default createNotification;
