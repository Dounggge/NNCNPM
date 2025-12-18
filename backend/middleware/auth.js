const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware xác thực token
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Không có token xác thực' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-me');
    
    const user = await User.findById(decoded.id).populate('nhanKhauId');
    if (!user) {
      return res.status(401).json({ message: 'User không tồn tại' });
    }

    if (user.trangThai !== 'active') {
      return res.status(401).json({ message: 'Tài khoản đã bị khóa' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Auth error:', error.message);
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

// Middleware phân quyền theo vai trò
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Chưa xác thực' });
    }

    if (!allowedRoles.includes(req.user.vaiTro)) {
      return res.status(403).json({ 
        message: 'Bạn không có quyền thực hiện hành động này',
        yourRole: req.user.vaiTro,
        requiredRoles: allowedRoles
      });
    }

    next();
  };
};

// Middleware kiểm tra quyền cụ thể
const checkPermission = (permission) => {
  const permissions = {
    // Quản lý nhân khẩu
    'nhankhau:read': ['admin', 'to_truong', 'ke_toan', 'chu_ho', 'dan_cu'],
    'nhankhau:create': ['admin', 'to_truong'],
    'nhankhau:update': ['admin', 'to_truong'],
    'nhankhau:delete': ['admin'],

    // Quản lý hộ khẩu
    'hokhau:read': ['admin', 'to_truong', 'ke_toan', 'chu_ho'],
    'hokhau:create': ['admin', 'to_truong'],
    'hokhau:update': ['admin', 'to_truong', 'chu_ho'],
    'hokhau:delete': ['admin'],

    // Quản lý thu phí
    'thuhi:read': ['admin', 'ke_toan', 'chu_ho'],
    'thuhi:create': ['admin', 'ke_toan'],
    'thuhi:update': ['admin', 'ke_toan'],
    'thuhi:delete': ['admin'],

    // Quản lý users
    'user:read': ['admin'],
    'user:create': ['admin'],
    'user:update': ['admin'],
    'user:delete': ['admin'],

    // Dashboard
    'dashboard:read': ['admin', 'to_truong', 'ke_toan'],
  };

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Chưa xác thực' });
    }

    const allowedRoles = permissions[permission];
    if (!allowedRoles) {
      return res.status(500).json({ message: 'Permission không tồn tại' });
    }

    if (!allowedRoles.includes(req.user.vaiTro)) {
      return res.status(403).json({ 
        message: 'Bạn không có quyền thực hiện hành động này',
        permission: permission,
        yourRole: req.user.vaiTro
      });
    }

    next();
  };
};

// Middleware kiểm tra chủ sở hữu (cho phép user sửa data của chính mình)
const isOwnerOrAdmin = (resourceField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Chưa xác thực' });
    }

    // Admin luôn được phép
    if (req.user.vaiTro === 'admin') {
      return next();
    }

    // Check owner
    const resourceUserId = req.body[resourceField] || req.params[resourceField];
    if (resourceUserId && resourceUserId.toString() === req.user._id.toString()) {
      return next();
    }

    return res.status(403).json({ 
      message: 'Bạn chỉ có thể thao tác trên dữ liệu của mình' 
    });
  };
};

module.exports = { 
  authenticate, 
  authorize, 
  checkPermission,
  isOwnerOrAdmin 
};