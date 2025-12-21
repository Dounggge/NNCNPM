const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ========== MIDDLEWARE XÁC THỰC TOKEN ==========
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'Không có token xác thực' 
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-me');
    
    const user = await User.findById(decoded.id).populate('nhanKhauId');
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'User không tồn tại' 
      });
    }

    if (user.trangThai !== 'active') {
      return res.status(403).json({ 
        success: false,
        message: 'Tài khoản đã bị khóa' 
      });
    }

    req.user = user;
    console.log('✅ Authenticated user:', user.userName, '| Role:', user.vaiTro);
    next();
  } catch (error) {
    console.error('❌ Auth error:', error.message);
    return res.status(401).json({ 
      success: false,
      message: 'Token không hợp lệ' 
    });
  }
};

// ========== MIDDLEWARE PHÂN QUYỀN THEO VAI TRÒ ==========
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    console.log('🔍 Authorization check:');
    console.log('   User:', req.user?.userName);
    console.log('   User role:', req.user?.vaiTro);
    console.log('   Allowed roles:', allowedRoles);

    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Chưa xác thực' 
      });
    }

    if (!allowedRoles.includes(req.user.vaiTro)) {
      console.log('❌ Authorization DENIED');
      return res.status(403).json({ 
        success: false,
        message: 'Bạn không có quyền thực hiện hành động này',
        yourRole: req.user.vaiTro,
        requiredRoles: allowedRoles
      });
    }

    console.log('✅ Authorization GRANTED');
    next();
  };
};

// ========== MIDDLEWARE KIỂM TRA QUYỀN CỤ THỂ ==========
const checkPermission = (permission) => {
  const permissions = {
    // Quản lý nhân khẩu
    'nhankhau:read': ['admin', 'to_truong', 'ke_toan', 'chu_ho', 'dan_cu'],
    'nhankhau:create': ['admin', 'to_truong', 'chu_ho', 'dan_cu'],
    'nhankhau:update': ['admin', 'to_truong', 'chu_ho', 'dan_cu'],
    'nhankhau:delete': ['admin', 'to_truong'],

    // Quản lý hộ khẩu
    'hokhau:read': ['admin', 'to_truong', 'ke_toan', 'chu_ho', 'dan_cu'],
    'hokhau:create': ['admin', 'to_truong', 'chu_ho', 'dan_cu'], // ← CHO PHÉP DÂN CƯ TẠO
    'hokhau:update': ['admin', 'to_truong', 'chu_ho'],
    'hokhau:delete': ['admin', 'to_truong'],

    // Quản lý thu phí
    'phieuthu:read': ['admin', 'ke_toan', 'to_truong', 'chu_ho', 'dan_cu'],
    'phieuthu:create': ['admin', 'ke_toan', 'to_truong'],
    'phieuthu:update': ['admin', 'ke_toan', 'to_truong'],
    'phieuthu:delete': ['admin', 'ke_toan'],

    // Quản lý khoản thu
    'khoanthu:read': ['admin', 'ke_toan', 'to_truong', 'chu_ho', 'dan_cu'],
    'khoanthu:create': ['admin', 'ke_toan', 'to_truong'],
    'khoanthu:update': ['admin', 'ke_toan', 'to_truong'],
    'khoanthu:delete': ['admin', 'ke_toan'],

    // Quản lý users
    'user:read': ['admin', 'to_truong'],
    'user:create': ['admin'],
    'user:update': ['admin', 'to_truong'],
    'user:delete': ['admin'],

    // Dashboard
    'dashboard:read': ['admin', 'to_truong', 'ke_toan', 'chu_ho', 'dan_cu'],

    // Đơn xin vào hộ
    'donxinvaoho:read': ['admin', 'to_truong', 'chu_ho', 'dan_cu'],
    'donxinvaoho:create': ['admin', 'to_truong', 'chu_ho', 'dan_cu'],
    'donxinvaoho:update': ['admin', 'to_truong'],
    'donxinvaoho:delete': ['admin', 'to_truong'],
  };

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Chưa xác thực' 
      });
    }

    const allowedRoles = permissions[permission];
    if (!allowedRoles) {
      return res.status(500).json({ 
        success: false,
        message: 'Permission không tồn tại' 
      });
    }

    if (!allowedRoles.includes(req.user.vaiTro)) {
      return res.status(403).json({ 
        success: false,
        message: 'Bạn không có quyền thực hiện hành động này',
        permission: permission,
        yourRole: req.user.vaiTro,
        requiredRoles: allowedRoles
      });
    }

    next();
  };
};

// ========== MIDDLEWARE KIỂM TRA CHỦ SỞ HỮU ==========
const isOwnerOrAdmin = (resourceField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Chưa xác thực' 
      });
    }

    // Admin hoặc tổ trưởng luôn được phép
    if (req.user.vaiTro === 'admin' || req.user.vaiTro === 'to_truong') {
      return next();
    }

    // Check owner
    const resourceUserId = req.body[resourceField] || req.params[resourceField];
    if (resourceUserId && resourceUserId.toString() === req.user._id.toString()) {
      return next();
    }

    return res.status(403).json({ 
      success: false,
      message: 'Bạn chỉ có thể thao tác trên dữ liệu của mình' 
    });
  };
};

// ========== MIDDLEWARE PHÂN QUYỀN CHO NHÂN KHẨU ==========
const authorizeOwnerOrAdmin = async (req, res, next) => {
  try {
    const NhanKhau = require('../models/NhanKhau');
    
    // Admin hoặc tổ trưởng được phép tất cả
    if (req.user.vaiTro === 'admin' || req.user.vaiTro === 'to_truong') {
      console.log('✅ Admin/Tổ trưởng access granted');
      return next();
    }

    // Lấy nhanKhauId từ params hoặc body
    const nhanKhauId = req.params.id || req.body.nhanKhauId;
    
    console.log('🔍 Checking ownership:');
    console.log('   nhanKhauId:', nhanKhauId);
    console.log('   req.user.nhanKhauId:', req.user.nhanKhauId);

    // Kiểm tra xem nhanKhauId có khớp với user hiện tại không
    if (req.user.nhanKhauId) {
      const userNhanKhauId = req.user.nhanKhauId._id || req.user.nhanKhauId;
      if (userNhanKhauId.toString() === nhanKhauId?.toString()) {
        console.log('✅ Owner access granted (via user.nhanKhauId)');
        return next();
      }
    }

    // Kiểm tra qua bảng NhanKhau (nếu có userId)
    const nhanKhau = await NhanKhau.findById(nhanKhauId);
    if (nhanKhau && nhanKhau.userId && nhanKhau.userId.toString() === req.user._id.toString()) {
      console.log('✅ Owner access granted (via NhanKhau.userId)');
      return next();
    }

    console.log('❌ Access denied');
    return res.status(403).json({ 
      success: false,
      message: 'Bạn không có quyền xem thông tin này' 
    });
  } catch (error) {
    console.error('❌ Authorization error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

module.exports = { 
  authenticate, 
  authorize, 
  checkPermission,
  isOwnerOrAdmin,
  authorizeOwnerOrAdmin  
};