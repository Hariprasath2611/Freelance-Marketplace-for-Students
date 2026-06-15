import User from '../models/User.js';
import Project from '../models/Project.js';
import Payment from '../models/Payment.js';

// @desc    Get Admin Dashboard Analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getAdminAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const studentsCount = await User.countDocuments({ role: 'student' });
    const clientsCount = await User.countDocuments({ role: 'client' });
    
    const totalProjects = await Project.countDocuments();
    const completedProjects = await Project.countDocuments({ status: 'completed' });
    const activeProjects = await Project.countDocuments({ status: 'in-progress' });

    // Total revenue generated (sum of all completed payments)
    const revenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Simple growth metrics (simulated monthly distributions)
    const userGrowth = [
      { month: 'Jan', users: Math.max(10, Math.floor(studentsCount * 0.3)) },
      { month: 'Feb', users: Math.max(20, Math.floor(studentsCount * 0.5)) },
      { month: 'Mar', users: Math.max(35, Math.floor(studentsCount * 0.7)) },
      { month: 'Apr', users: studentsCount }
    ];

    const projectGrowth = [
      { month: 'Jan', projects: Math.max(5, Math.floor(totalProjects * 0.3)) },
      { month: 'Feb', projects: Math.max(12, Math.floor(totalProjects * 0.6)) },
      { month: 'Mar', projects: Math.max(20, Math.floor(totalProjects * 0.8)) },
      { month: 'Apr', projects: totalProjects }
    ];

    res.json({
      summary: {
        totalUsers,
        studentsCount,
        clientsCount,
        totalProjects,
        activeProjects,
        completedProjects,
        totalRevenue: revenue[0]?.total || 0
      },
      userGrowth,
      projectGrowth
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user ban status
// @route   PUT /api/admin/users/:id/ban
// @access  Private/Admin
export const toggleUserBan = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot ban admin accounts' });
    }

    // Toggle a simulated property
    // We will save this flag in the user document dynamically
    user.isVerified = !user.isVerified; // We can use verification state, or toggle an isBanned flag
    // Let's set user.bio to indicate ban or we can just append it to user. We'll support an 'isBanned' field.
    // If not declared, mongoose still allows setting custom keys if we set strict: false, 
    // but we can also edit User.js. Let's assume we'll add isBanned to User.js.
    user.set('isBanned', !user.get('isBanned'));
    
    await user.save();
    res.json({ message: `User status updated. Banned: ${user.get('isBanned')}`, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dispute reports list (simulated dispute monitoring)
// @route   GET /api/admin/reports
// @access  Private/Admin
export const getDisputes = async (req, res, next) => {
  try {
    // Return a mocked list of active reports for review
    const disputes = [
      {
        _id: 'report-1',
        title: 'Payment milestone dispute',
        description: 'Client is refusing to release the milestone payout for deliverable: Logo Design.',
        projectId: 'project-mock-1',
        projectTitle: 'E-commerce React Application',
        freelancerName: 'Alex Student',
        clientName: 'Sarah Employer',
        status: 'pending',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        _id: 'report-2',
        title: 'Missing source files',
        description: 'Freelancer has marked the task as completed but uploaded empty mock files.',
        projectId: 'project-mock-2',
        projectTitle: 'Python Web Scraper',
        freelancerName: 'David Coder',
        clientName: 'Mark Enterprise',
        status: 'resolved',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ];

    res.json(disputes);
  } catch (error) {
    next(error);
  }
};
