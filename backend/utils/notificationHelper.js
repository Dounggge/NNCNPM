const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Tạo thông báo cho 1 user cụ thể
 * @param {ObjectId} userId - ID người nhận
 * @param {String} type - Loại thông báo (info, success, warning, error)
 * @param {String} title - Tiêu đề
 * @param {String} message - Nội dung
 * @param {String} link - Link liên quan (optional)
 */
exports.createNotification = async (userId, type, title, message, link = null) => {
  try {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      link
    });
    
    await notification.save();
    console.log(`✅ Created notification for user: ${userId}`);
    return notification;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    throw error;
  }
};

/**
 * Tạo thông báo cho nhiều user theo vai trò
 */
exports.createNotificationForRoles = async (roles, type, title, message, link = null) => {
  try {
    const users = await User.find({ 
      vaiTro: { $in: roles },
      trangThai: 'active'
    });

    if (users.length === 0) {
      console.log('⚠️ No users found with roles:', roles);
      return;
    }

    const notifications = users.map(user => ({
      userId: user._id,
      type,
      title,
      message,
      link
    }));

    await Notification.insertMany(notifications);
    
    console.log(`✅ Created ${notifications.length} notifications for roles:`, roles);
    return notifications;
  } catch (error) {
    console.error('❌ Error creating notifications:', error);
    throw error;
  }
};