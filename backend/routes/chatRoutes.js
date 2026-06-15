import express from 'express';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/multer.js';
import { getConversations, getMessages, sendMessage } from '../controllers/chatController.js';

const router = express.Router();

router.use(protect); // All chat routes require authentication

router.get('/conversations', getConversations);
router.get('/messages/:receiverId', getMessages);
router.post('/messages', upload.single('attachment'), sendMessage);

export default router;
