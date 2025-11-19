// server/controllers/adminDashboardController.js
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Subscription = require('../models/Subscription');
const mongoose = require('mongoose');

/**
 * Get dashboard statistics (KPIs)
 * GET /api/admin/dashboard/stats
 */
exports.getStats = async (req, res) => {
  try {
    console.log('📊 [Admin] Getting dashboard stats');
    
    // Get current month range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    // Total users by type
    const totalTeachers = await User.countDocuments({ userType: 'teacher' });
    const totalInstitutions = await User.countDocuments({ userType: 'institution' });
    const totalUsers = totalTeachers + totalInstitutions;
    
    // Users this month
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });
    
    // Total jobs
    const totalJobs = await Job.countDocuments({ isDeleted: false });
    const activeJobs = await Job.countDocuments({ 
      status: 'active', 
      isDeleted: false,
      expiresAt: { $gt: now }
    });
    const pendingJobs = await Job.countDocuments({ 
      status: 'pending',
      isDeleted: false 
    });
    
    // Jobs this month
    const jobsPostedThisMonth = await Job.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      isDeleted: false
    });
    
    // Total applications
    const totalApplications = await Application.countDocuments();
    const pendingApplications = await Application.countDocuments({ status: 'pending' });
    
    // Applications this month
    const applicationsThisMonth = await Application.countDocuments({
      appliedAt: { $gte: startOfMonth, $lte: endOfMonth }
    });
    
    // Revenue calculations (mock - replace with actual Razorpay data)
    const activeSubscriptions = await Subscription.countDocuments({ 
      status: 'active' 
    });
    
    // Calculate monthly revenue based on subscription tiers
    const subscriptionRevenue = await Subscription.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $switch: {
                branches: [
                  { case: { $eq: ['$tier', 'professional'] }, then: 1499 },
                  { case: { $eq: ['$tier', 'premium'] }, then: 3999 },
                  { case: { $eq: ['$tier', 'enterprise'] }, then: 9999 }
                ],
                default: 0
              }
            }
          }
        }
      }
    ]);
    
    const monthlyRevenue = subscriptionRevenue.length > 0 
      ? subscriptionRevenue[0].total 
      : 0;
    
    // User growth percentage
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthUsers = await User.countDocuments({
      createdAt: { $lt: startOfMonth }
    });
    const userGrowth = lastMonthUsers > 0 
      ? ((newUsersThisMonth / lastMonthUsers) * 100).toFixed(1)
      : 0;
    
    console.log('✓ Dashboard stats calculated');
    
    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          teachers: totalTeachers,
          institutions: totalInstitutions,
          newThisMonth: newUsersThisMonth,
          growthPercentage: parseFloat(userGrowth)
        },
        jobs: {
          total: totalJobs,
          active: activeJobs,
          pending: pendingJobs,
          postedThisMonth: jobsPostedThisMonth
        },
        applications: {
          total: totalApplications,
          pending: pendingApplications,
          thisMonth: applicationsThisMonth
        },
        revenue: {
          monthlyRevenue: monthlyRevenue,
          activeSubscriptions: activeSubscriptions,
          currency: 'INR'
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Get dashboard stats error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch dashboard statistics',
      message: error.message
    });
  }
};

/**
 * Get chart data (user growth, revenue over time)
 * GET /api/admin/dashboard/charts
 */
exports.getCharts = async (req, res) => {
  try {
    const { period = 'month' } = req.query; // 'week', 'month', 'year'
    
    console.log('📈 [Admin] Getting chart data for period:', period);
    
    // Calculate date range based on period
    const now = new Date();
    let startDate;
    let groupFormat;
    
    if (period === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      groupFormat = '%Y-%m-%d';
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      groupFormat = '%Y-%m-%d';
    } else if (period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
      groupFormat = '%Y-%m';
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      groupFormat = '%Y-%m-%d';
    }
    
    // User growth over time
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
          teachers: {
            $sum: { $cond: [{ $eq: ['$userType', 'teacher'] }, 1, 0] }
          },
          institutions: {
            $sum: { $cond: [{ $eq: ['$userType', 'institution'] }, 1, 0] }
          },
          total: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          teachers: 1,
          institutions: 1,
          total: 1,
          _id: 0
        }
      }
    ]);
    
    // Applications over time
    const applicationsTrend = await Application.aggregate([
      {
        $match: {
          appliedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: '$appliedAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);
    
    // Jobs posted over time
    const jobsTrend = await Job.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);
    
    // Revenue over time (mock data - replace with actual payment data)
    // You'll need to query actual payment records from Razorpay
    const revenueTrend = await Subscription.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: 'active'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
          revenue: {
            $sum: {
              $switch: {
                branches: [
                  { case: { $eq: ['$tier', 'professional'] }, then: 1499 },
                  { case: { $eq: ['$tier', 'premium'] }, then: 3999 },
                  { case: { $eq: ['$tier', 'enterprise'] }, then: 9999 }
                ],
                default: 0
              }
            }
          }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          revenue: 1,
          _id: 0
        }
      }
    ]);
    
    console.log('✓ Chart data generated');
    
    res.json({
      success: true,
      period,
      charts: {
        userGrowth,
        applicationsTrend,
        jobsTrend,
        revenueTrend
      }
    });
    
  } catch (error) {
    console.error('❌ Get chart data error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch chart data',
      message: error.message
    });
  }
};
