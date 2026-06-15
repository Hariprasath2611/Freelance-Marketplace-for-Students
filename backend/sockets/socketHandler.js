import { Server } from 'socket.io';
import Message from '../models/Message.js';

let io = null;
const onlineUsers = new Map(); // Maps userId -> socketId

export const initSocket = (server) => {
  io = new Server(server, {
    path: '/_/backend/socket.io',
    cors: {
      origin: '*', // Allow all origins in dev, can customize for production
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket client connected: ${socket.id}`);

    // Join room of the logged-in user
    socket.on('join', (userId) => {
      if (userId) {
        socket.join(userId.toString());
        onlineUsers.set(userId.toString(), socket.id);
        console.log(`User ${userId} joined room. Total online: ${onlineUsers.size}`);
        
        // Broadcast user status changed to online
        socket.broadcast.emit('userStatusChanged', { userId, status: 'online' });
      }
    });

    // Real-time message relay
    socket.on('sendMessage', async ({ senderId, receiverId, message, attachment }) => {
      try {
        const msg = await Message.create({
          senderId,
          receiverId,
          message,
          attachment: attachment || { name: '', url: '', fileType: '' }
        });

        // Emit to sender & receiver rooms
        io.to(senderId.toString()).to(receiverId.toString()).emit('messageReceived', msg);
        
        // Trigger a socket notification count update
        io.to(receiverId.toString()).emit('newUnreadMessage', {
          senderId,
          message: message || 'Sent an attachment'
        });
      } catch (error) {
        console.error('Socket message save error:', error.message);
      }
    });

    // Typing indicators
    socket.on('typing', ({ senderId, receiverId, isTyping }) => {
      io.to(receiverId.toString()).emit('typingStatus', { senderId, isTyping });
    });

    // Seen status updates
    socket.on('messageSeen', async ({ messageId, senderId, receiverId }) => {
      try {
        if (messageId) {
          await Message.findByIdAndUpdate(messageId, { isSeen: true });
        } else {
          // Mark all messages from senderId to receiverId as read
          await Message.updateMany(
            { senderId, receiverId, isSeen: false },
            { $set: { isSeen: true } }
          );
        }
        io.to(senderId.toString()).emit('messagesMarkedSeen', { receiverId });
      } catch (error) {
        console.error('Socket messageSeen error:', error.message);
      }
    });

    // Check user online status
    socket.on('checkOnline', ({ userId }, callback) => {
      const isOnline = onlineUsers.has(userId.toString());
      if (typeof callback === 'function') {
        callback({ userId, status: isOnline ? 'online' : 'offline' });
      }
    });

    socket.on('disconnect', () => {
      // Find and remove disconnected user
      let disconnectedUser = null;
      for (let [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUser = userId;
          onlineUsers.delete(userId);
          break;
        }
      }

      if (disconnectedUser) {
        console.log(`User ${disconnectedUser} disconnected. Total online: ${onlineUsers.size}`);
        socket.broadcast.emit('userStatusChanged', { userId: disconnectedUser, status: 'offline' });
      }
    });
  });

  return io;
};

export const getIO = () => {
  return io;
};
