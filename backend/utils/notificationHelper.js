const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Tạo thông báo cho nhiều user theo vai trò
 */
exports.createNotificationForRoles = async (roles, notificationData) => {
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
      ...notificationData
    }));

    await Notification.insertMany(notifications);
    
    console.log(`✅ Created ${notifications.length} notifications for roles:`, roles);
  } catch (error) {
    console.error('❌ Error creating notifications:', error);
    throw error;
  }
};

/**
 * Tạo thông báo cho 1 user cụ thể
 */
exports.createNotification = async (userId, notificationData) => {
  try {
    const notification = new Notification({
      userId,
      ...notificationData
    });
    
    await notification.save();
    console.log('✅ Created notification for user:', userId);
    return notification;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    throw error;
  }
};