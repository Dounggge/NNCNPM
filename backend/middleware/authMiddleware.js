const { authenticate, authorize, checkPermission, isOwnerOrAdmin } = require('./auth');

// Export lại với tên khác để tương thích
module.exports = {
  protect: authenticate,      // protect = authenticate
  authorize,                   // giữ nguyên
  checkPermission,             // giữ nguyên
  isOwnerOrAdmin              // giữ nguyên
};