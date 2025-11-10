const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify token
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Vui lòng đăng nhập' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-me');
    const user = await User.findById(decoded.id);

    if (!user || user.trangThai !== 'active') {
      return res.status(401).json({ message: 'Tài khoản không hợp lệ' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

// Check roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.vaiTro)) {
      return res.status(403).json({ 
        message: 'Bạn không có quyền truy cập chức năng này' 
      });
    }
    next();
  };
};

module.exports = { authenticate, authorize };