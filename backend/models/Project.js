import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  deadline: { type: Date }
});

const deliverableSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  fileUrl: { type: String },
  submittedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
});

const workspaceFileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  fileUrl: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedAt: { type: Date, default: Date.now }
});

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  skillsRequired: [{ type: String }],
  budget: { type: Number, required: true },
  deadline: { type: Date, required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['draft', 'published', 'in-progress', 'completed', 'closed'], 
    default: 'published' 
  },
  
  // Workspace specific fields (populated after client hires a freelancer)
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  milestones: [milestoneSchema],
  deliverables: [deliverableSchema],
  files: [workspaceFileSchema]
}, {
  timestamps: true
});

const Project = mongoose.model('Project', projectSchema);
export default Project;
