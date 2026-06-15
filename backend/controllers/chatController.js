import Message from '../models/Message.js';
import User from '../models/User.js';

// @desc    Get all active conversations (chats list)
// @route   GET /api/chat/conversations
// @access  Private
export const getConversations = async (req, res, next) => {
  const userId = req.user._id;

  try {
    // Find all messages involving the user
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).sort({ createdAt: -1 });

    const conversationUsers = {};

    messages.forEach((msg) => {
      const otherUser = msg.senderId.toString() === userId.toString() ? msg.receiverId : msg.senderId;
      const otherUserId = otherUser.toString();

      if (!conversationUsers[otherUserId]) {
        conversationUsers[otherUserId] = {
          lastMessage: msg.message || (msg.attachment?.name ? 'Attachment: ' + msg.attachment.name : ''),
          lastMessageTime: msg.createdAt,
          unreadCount: 0,
          user: otherUser
        };
      }
      
      // Calculate unread count (messages sent by the other user which are not read)
      if (msg.receiverId.toString() === userId.toString() && !msg.isSeen) {
        conversationUsers[otherUserId].unreadCount += 1;
      }
    });

    // Populate user details
    const userIds = Object.keys(conversationUsers);
    const users = await User.find({ _id: { $in: userIds } }).select('name email profileImage role');

    const conversationList = users.map((u) => {
      const details = conversationUsers[u._id.toString()];
      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        profileImage: u.profileImage,
        role: u.role,
        lastMessage: details.lastMessage,
        lastMessageTime: details.lastMessageTime,
        unreadCount: details.unreadCount
      };
    }).sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

    res.json(conversationList);
  } catch (error) {
    next(error);
  }
};

// @desc    Get chat message history with a specific user
// @route   GET /api/chat/messages/:receiverId
// @access  Private
export const getMessages = async (req, res, next) => {
  const userId = req.user._id;
  const otherUserId = req.params.receiverId;

  try {
    // Retrieve full chat history
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    }).sort({ createdAt: 1 });

    // Mark messages sent by the other user to me as read
    await Message.updateMany(
      { senderId: otherUserId, receiverId: userId, isSeen: false },
      { $set: { isSeen: true } }
    );

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message (REST fallback / attachment support)
// @route   POST /api/chat/messages
// @access  Private
export const sendMessage = async (req, res, next) => {
  const { receiverId, message } = req.body;
  const senderId = req.user._id;

  try {
    let attachment = undefined;

    if (req.file) {
      attachment = {
        name: req.file.originalname,
        url: `/uploads/${req.file.filename}`,
        fileType: req.file.mimetype
      };
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      message: message || '',
      attachment
    });

    res.status(201).json(newMessage);
  } catch (error) {
    next(error);
  }
};
