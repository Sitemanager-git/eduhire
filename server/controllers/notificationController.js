const Notification = require('../models/Notification');

/**
 * Get user's notifications - CONTRACT ENFORCED
 * GET /api/notifications
 * @contract Response: [{ _id, userId, message, type, read, createdAt }]
 */
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      page = 1, 
      limit = 20, 
      unreadOnly = false 
    } = req.query;

    console.log('📖 [Notifications] Getting notifications for user:', userId);

    const query = { userId };
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    console.log(`✓ Found ${notifications.length} notifications`);

    // Map to contract field names (isRead → read)
    const contractNotifications = notifications.map(n => ({
      _id: n._id,
      userId: n.userId,
      message: n.message,
      type: n.type,
      read: n.read || n.isRead || false,
      createdAt: n.createdAt
    }));

    // Return array directly per contract
    res.json(contractNotifications);

  } catch (error) {
    console.error('❌ Get notifications error:', error);
    res.status(500).json({
      error: 'Failed to fetch notifications',
      message: error.message
    });
  }
};

/**
 * Get unread notification count - CONTRACT ENFORCED
 * GET /api/notifications/unread-count
 * @contract Response: { count }
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('📊 [Notifications] Getting unread count for user:', userId);

    const count = await Notification.countDocuments({ 
      userId, 
      read: { $ne: true }
    });

    console.log(`✓ Unread count: ${count}`);
    res.json({ count });

  } catch (error) {
    console.error('❌ Get unread count error:', error);
    res.status(500).json({
      error: 'Failed to fetch unread count',
      message: error.message
    });
  }
};

/**
 * Mark notification as read - CONTRACT ENFORCED
 * PATCH /api/notifications/:id/read
 * @contract Response: { _id, read: true }
 */
exports.markAsReadContract = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log('✏️ [Notifications] Marking as read:', id);

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { read: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      console.warn('⚠️ Notification not found');
      return res.status(404).json({ error: 'Notification not found' });
    }

    console.log('✓ Marked as read');
    res.json({
      _id: notification._id,
      read: true
    });

  } catch (error) {
    console.error('❌ Mark as read error:', error);
    res.status(500).json({
      error: 'Failed to mark notification as read',
      message: error.message
    });
  }
};

/**
 * Delete notification - CONTRACT ENFORCED
 * DELETE /api/notifications/:id
 * @contract Response: { message }
 */
exports.deleteNotificationContract = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log('🗑️ [Notifications] Deleting:', id);

    const notification = await Notification.findOneAndDelete({ 
      _id: id, 
      userId 
    });

    if (!notification) {
      console.warn('⚠️ Notification not found');
      return res.status(404).json({ error: 'Notification not found' });
    }

    console.log('✓ Deleted');
    res.json({
      message: 'Notification deleted'
    });

  } catch (error) {
    console.error('❌ Delete notification error:', error);
    res.status(500).json({
      error: 'Failed to delete notification',
      message: error.message
    });
  }
};

/**
 * Mark notification as read (old endpoint - legacy)
 * PUT /api/notifications/:id/read
 */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      notification
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      error: 'Failed to mark notification as read',
      message: error.message
    });
  }
};

/**
 * Mark all notifications as read
 * PUT /api/notifications/read-all
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`
    });

  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      error: 'Failed to mark all notifications as read',
      message: error.message
    });
  }
};

/**
 * Delete notification (old endpoint - legacy)
 * DELETE /api/notifications/:id
 */
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndDelete({ 
      _id: id, 
      userId 
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      error: 'Failed to delete notification',
      message: error.message
    });
  }
};

/**
 * Helper: Create notification (used by other controllers)
 */
exports.createNotification = async (notificationData) => {
  try {
    const notification = new Notification(notificationData);
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
};

module.exports = exports;
