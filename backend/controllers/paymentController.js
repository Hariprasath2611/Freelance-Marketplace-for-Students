import Payment from '../models/Payment.js';
import Project from '../models/Project.js';

// @desc    Pay / Payout a project milestone (simulated payment)
// @route   POST /api/payments
// @access  Private/Client
export const processPayment = async (req, res, next) => {
  const { projectId, milestoneId, amount } = req.body;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project owner can release payments' });
    }

    // Find and update the milestone status
    const milestone = project.milestones.id(milestoneId);
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    if (milestone.status === 'completed') {
      return res.status(400).json({ message: 'Milestone is already paid' });
    }

    milestone.status = 'completed';
    await project.save();

    // Create payment transaction log
    const payment = await Payment.create({
      projectId,
      clientId: req.user._id,
      freelancerId: project.freelancerId,
      amount: amount || milestone.amount,
      status: 'completed',
      paymentDate: new Date()
    });

    res.status(201).json({
      message: 'Payment released successfully',
      payment,
      milestones: project.milestones
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment history for a project workspace
// @route   GET /api/payments/project/:projectId
// @access  Private
export const getProjectPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ projectId: req.params.projectId })
      .populate('clientId', 'name email')
      .populate('freelancerId', 'name email');
    res.json(payments);
  } catch (error) {
    next(error);
  }
};

// @desc    Get earnings aggregates for freelancer dashboard charts
// @route   GET /api/payments/earnings
// @access  Private/Student
export const getFreelancerEarnings = async (req, res, next) => {
  try {
    const freelancerId = req.user._id;

    // Total Earnings Aggregate
    const totalEarnings = await Payment.aggregate([
      { $match: { freelancerId, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Monthly Earnings for Chart (last 6 months)
    const monthlyEarnings = await Payment.aggregate([
      { 
        $match: { 
          freelancerId, 
          status: 'completed',
          paymentDate: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) } 
        } 
      },
      {
        $group: {
          _id: { $month: '$paymentDate' },
          amount: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format monthly earnings for charts
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedMonthly = monthlyEarnings.map(item => ({
      month: months[item._id - 1] || `Month ${item._id}`,
      earnings: item.amount
    }));

    res.json({
      totalEarnings: totalEarnings[0]?.total || 0,
      monthlyEarnings: formattedMonthly
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get spendings aggregates for client dashboard charts
// @route   GET /api/payments/spending
// @access  Private/Client
export const getClientSpending = async (req, res, next) => {
  try {
    const clientId = req.user._id;

    // Total Spent Aggregate
    const totalSpent = await Payment.aggregate([
      { $match: { clientId, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Monthly Spent for Chart (last 6 months)
    const monthlySpent = await Payment.aggregate([
      { 
        $match: { 
          clientId, 
          status: 'completed',
          paymentDate: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) } 
        } 
      },
      {
        $group: {
          _id: { $month: '$paymentDate' },
          amount: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedMonthly = monthlySpent.map(item => ({
      month: months[item._id - 1] || `Month ${item._id}`,
      spending: item.amount
    }));

    res.json({
      totalSpent: totalSpent[0]?.total || 0,
      monthlySpending: formattedMonthly
    });
  } catch (error) {
    next(error);
  }
};
