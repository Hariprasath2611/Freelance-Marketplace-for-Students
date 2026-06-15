import mongoose from 'mongoose';

const proposalSchema = new mongoose.Schema({
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  coverLetter: { type: String, required: true },
  bidAmount: { type: Number, required: true },
  deliveryDays: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected'], 
    default: 'pending' 
  },
  aiMatchScore: { type: Number, default: 0 },
  aiMatchReason: { type: String, default: '' }
}, {
  timestamps: true
});

const Proposal = mongoose.model('Proposal', proposalSchema);
export default Proposal;
