import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const educationSchema = new mongoose.Schema({
  school: { type: String, required: true },
  degree: { type: String, required: true },
  fieldOfStudy: { type: String },
  startYear: { type: String },
  endYear: { type: String }
});

const experienceSchema = new mongoose.Schema({
  company: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  startYear: { type: String },
  endYear: { type: String }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'client', 'admin'], default: 'student' },
  profileImage: { type: String, default: '' },
  skills: [{ type: String }],
  education: [educationSchema],
  experience: [experienceSchema],
  bio: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  totalProjects: { type: Number, default: 0 },
  resume: { type: String, default: '' },
  socialLinks: {
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' },
    website: { type: String, default: '' }
  },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
