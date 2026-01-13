const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Match = require('../models/Match');
const Notification = require('../models/Notification');
const Message = require('../models/Message');
const MessageRequest = require('../models/MessageRequest');
const { authenticate } = require('../middleware/auth');

// Helper function to get date ranges
const getDateRange = (period) => {
  const now = new Date();
  let start;
  
  switch(period) {
    case 'today':
      start = new Date(now.setHours(0, 0, 0, 0));
      break;
    case 'week':
      start = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      start = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case 'year':
      start = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      start = new Date(0); // All time
  }
  
  return { start, end: new Date() };
};

// Get overview statistics
router.get('/overview', authenticate, async (req, res, next) => {
  try {
    const { period = 'all' } = req.query;
    const { start, end } = getDateRange(period);
    
    const dateFilter = period !== 'all' ? { createdAt: { $gte: start, $lte: end } } : {};
    
    const [
      totalUsers,
      newUsers,
      premiumUsers,
      activeUsers,
      totalMatches,
      newMatches,
      totalVibes,
      newVibes,
      totalMessages,
      newMessages,
      totalRequests,
      newRequests,
      usersWithImages
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments(dateFilter),
      User.countDocuments({ isPremium: true }),
      User.countDocuments({ 
        ...dateFilter,
        updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }),
      Match.countDocuments(),
      Match.countDocuments(dateFilter),
      Notification.countDocuments(),
      Notification.countDocuments(dateFilter),
      Message.countDocuments(),
      Message.countDocuments(dateFilter),
      MessageRequest.countDocuments(),
      MessageRequest.countDocuments(dateFilter),
      User.countDocuments({ imageUrl: { $exists: true, $ne: '' } })
    ]);

    res.json({
      users: {
        total: totalUsers,
        new: newUsers,
        premium: premiumUsers,
        active: activeUsers,
        withImages: usersWithImages,
        profileCompletionRate: totalUsers > 0 ? ((usersWithImages / totalUsers) * 100).toFixed(2) : 0
      },
      matches: {
        total: totalMatches,
        new: newMatches
      },
      vibes: {
        total: totalVibes,
        new: newVibes
      },
      messages: {
        total: totalMessages,
        new: newMessages
      },
      messageRequests: {
        total: totalRequests,
        new: newRequests
      },
      period,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Get user metrics
router.get('/users', authenticate, async (req, res, next) => {
  try {
    const { period = 'all', limit = 100 } = req.query;
    const { start, end } = getDateRange(period);
    
    const dateFilter = period !== 'all' ? { createdAt: { $gte: start, $lte: end } } : {};
    
    const users = await User.find(dateFilter)
      .select('name email college year gender isPremium createdAt updatedAt imageUrl')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    const stats = {
      total: await User.countDocuments(),
      premium: await User.countDocuments({ isPremium: true }),
      free: await User.countDocuments({ isPremium: false }),
      withImages: await User.countDocuments({ imageUrl: { $exists: true, $ne: '' } }),
      verified: await User.countDocuments({ emailVerified: true })
    };
    
    // College distribution
    const collegeDistribution = await User.aggregate([
      { $group: { _id: '$college', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Year distribution
    const yearDistribution = await User.aggregate([
      { $group: { _id: '$year', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    // Gender distribution
    const genderDistribution = await User.aggregate([
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]);
    
    res.json({
      users,
      stats,
      distributions: {
        college: collegeDistribution,
        year: yearDistribution,
        gender: genderDistribution
      },
      period,
      count: users.length
    });
  } catch (error) {
    next(error);
  }
});

// Get engagement metrics
router.get('/engagement', authenticate, async (req, res, next) => {
  try {
    const { period = 'all' } = req.query;
    const { start, end } = getDateRange(period);
    
    const dateFilter = period !== 'all' ? { createdAt: { $gte: start, $lte: end } } : {};
    
    // Vibes sent/received
    const vibesSent = await Notification.countDocuments(dateFilter);
    const vibesReceived = await Notification.countDocuments({ 
      ...dateFilter,
      toUserId: { $exists: true }
    });
    
    // Vibes by premium vs free
    const vibesByPremium = await Notification.aggregate([
      { $match: dateFilter },
      {
        $lookup: {
          from: 'users',
          localField: 'fromUserId',
          foreignField: '_id',
          as: 'sender'
        }
      },
      { $unwind: '$sender' },
      {
        $group: {
          _id: '$sender.isPremium',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Match rate
    const totalVibes = await Notification.countDocuments();
    const totalMatches = await Match.countDocuments();
    const matchRate = totalVibes > 0 ? ((totalMatches / totalVibes) * 100).toFixed(2) : 0;
    
    // Most popular adjectives
    const popularAdjectives = await Notification.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$adjective', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Match adjectives
    const matchAdjectives = await Match.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$adjective', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({
      vibes: {
        sent: vibesSent,
        received: vibesReceived,
        byPremium: vibesByPremium
      },
      matches: {
        total: await Match.countDocuments(dateFilter),
        matchRate: parseFloat(matchRate)
      },
      adjectives: {
        popular: popularAdjectives,
        matchAdjectives: matchAdjectives
      },
      period
    });
  } catch (error) {
    next(error);
  }
});

// Get messaging metrics
router.get('/messaging', authenticate, async (req, res, next) => {
  try {
    const { period = 'all' } = req.query;
    const { start, end } = getDateRange(period);
    
    const dateFilter = period !== 'all' ? { createdAt: { $gte: start, $lte: end } } : {};
    
    const totalMessages = await Message.countDocuments(dateFilter);
    const unreadMessages = await Message.countDocuments({ 
      ...dateFilter,
      read: false 
    });
    
    // Messages by premium vs free
    const messagesByPremium = await Message.aggregate([
      { $match: dateFilter },
      {
        $lookup: {
          from: 'users',
          localField: 'fromUserId',
          foreignField: '_id',
          as: 'sender'
        }
      },
      { $unwind: '$sender' },
      {
        $group: {
          _id: '$sender.isPremium',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Active conversations
    const activeConversations = await Message.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            $cond: [
              { $lt: ['$fromUserId', '$toUserId'] },
              { from: '$fromUserId', to: '$toUserId' },
              { from: '$toUserId', to: '$fromUserId' }
            ]
          }
        }
      },
      { $count: 'conversations' }
    ]);
    
    // Average messages per conversation
    const avgMessages = await Message.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            $cond: [
              { $lt: ['$fromUserId', '$toUserId'] },
              { from: '$fromUserId', to: '$toUserId' },
              { from: '$toUserId', to: '$fromUserId' }
            ]
          },
          messageCount: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          avg: { $avg: '$messageCount' }
        }
      }
    ]);
    
    res.json({
      messages: {
        total: totalMessages,
        unread: unreadMessages,
        byPremium: messagesByPremium
      },
      conversations: {
        active: activeConversations[0]?.conversations || 0,
        avgMessages: avgMessages[0]?.avg ? avgMessages[0].avg.toFixed(2) : 0
      },
      period
    });
  } catch (error) {
    next(error);
  }
});

// Get message request metrics
router.get('/message-requests', authenticate, async (req, res, next) => {
  try {
    const { period = 'all' } = req.query;
    const { start, end } = getDateRange(period);
    
    const dateFilter = period !== 'all' ? { createdAt: { $gte: start, $lte: end } } : {};
    
    const total = await MessageRequest.countDocuments(dateFilter);
    const pending = await MessageRequest.countDocuments({ 
      ...dateFilter,
      status: 'pending' 
    });
    const accepted = await MessageRequest.countDocuments({ 
      ...dateFilter,
      status: 'accepted' 
    });
    const declined = await MessageRequest.countDocuments({ 
      ...dateFilter,
      status: 'declined' 
    });
    
    const acceptanceRate = total > 0 ? ((accepted / total) * 100).toFixed(2) : 0;
    const declineRate = total > 0 ? ((declined / total) * 100).toFixed(2) : 0;
    
    res.json({
      total,
      pending,
      accepted,
      declined,
      acceptanceRate: parseFloat(acceptanceRate),
      declineRate: parseFloat(declineRate),
      period
    });
  } catch (error) {
    next(error);
  }
});

// Get time-based analytics (DAU, WAU, MAU)
router.get('/activity', authenticate, async (req, res, next) => {
  try {
    const now = new Date();
    
    // Daily Active Users (last 24 hours)
    const dau = await User.countDocuments({
      updatedAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
    });
    
    // Weekly Active Users (last 7 days)
    const wau = await User.countDocuments({
      updatedAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
    });
    
    // Monthly Active Users (last 30 days)
    const mau = await User.countDocuments({
      updatedAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
    });
    
    // Activity by hour (last 24 hours)
    const hourlyActivity = await Notification.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      activeUsers: {
        daily: dau,
        weekly: wau,
        monthly: mau
      },
      hourlyActivity,
      timestamp: now.toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Get premium metrics
router.get('/premium', authenticate, async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const premiumUsers = await User.countDocuments({ isPremium: true });
    const conversionRate = totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(2) : 0;
    
    // Premium users by signup date
    const premiumByDate = await User.aggregate([
      { $match: { isPremium: true } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ]);
    
    res.json({
      totalUsers,
      premiumUsers,
      freeUsers: totalUsers - premiumUsers,
      conversionRate: parseFloat(conversionRate),
      premiumByDate,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
