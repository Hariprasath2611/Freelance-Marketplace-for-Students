import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  type: { 
    type: String, 
    enum: ['bid', 'proposal_status', 'chat', 'payment', 'project_status', 'review', 'system'], 
    default: 'system' 
  }
}, {
  timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
