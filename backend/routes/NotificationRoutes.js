const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { authenticate } = require('../middleware/auth');

console.log('📢 NotificationRoutes loaded'); // ← THÊM LOG

// GET ALL
router.get('/', authenticate, async (req, res) => {
  try {
    console.log('📥 GET /api/notifications - User:', req.user.userName); // ← LOG
    
    const { page = 1, limit = 20, isRead } = req.query;

    let query = { userId: req.user._id };
    
    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      userId: req.user._id, 
      isRead: false 
    });

    console.log(`📊 Found ${notifications.length} notifications, ${unreadCount} unread`); // ← LOG

    res.json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('❌ Get notifications error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// MARK AS READ
router.patch('/:id/read', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!notification) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy thông báo' 
      });
    }

    notification.isRead = true;
    await notification.save();

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// MARK ALL AS READ
router.patch('/read-all', authenticate, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'Đã đánh dấu tất cả là đã đọc'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// DELETE
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông báo'
      });
    }

    // ← CHỈ CHỦ SỞ HỮU HOẶC ADMIN MỚI XÓA ĐƯỢC
    if (notification.userId.toString() !== req.user._id.toString() && req.user.vaiTro !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa thông báo này'
      });
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Đã xóa thông báo'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

module.exports = router;