const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');

// GET ALL USERS
router.get('/', authenticate, authorize('admin', 'to_truong'), async (req, res) => {
  try {
    const users = await User.find()
      .populate('nhanKhauId', 'hoTen canCuocCongDan ngaySinh')
      .select('-password')
      .sort({ createdAt: -1 });

    // ← MAP ĐỂ TRẢ VỀ ĐỦ CẢ `role` VÀ `vaiTro` (tương thích)
    const formattedUsers = users.map(user => ({
      ...user.toObject(),
      role: user.vaiTro,        // ← THÊM FIELD `role` = `vaiTro`
      username: user.userName   // ← THÊM FIELD `username` = `userName`
    }));

    res.json({
      success: true,
      data: formattedUsers
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// UPDATE ROLE
router.put('/:userId/role', authenticate, authorize('admin', 'to_truong'), async (req, res) => {
  try {
    const { role, vaiTro } = req.body;
    const newRole = vaiTro || role;

    if (!newRole) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu vai trò'
      });
    }

    // Phân quyền gắn vai trò
    let allowedRoles = [];

    if (req.user.vaiTro === 'admin') {
      allowedRoles = ['admin', 'to_truong', 'ke_toan', 'chu_ho', 'dan_cu'];
    }

    if (req.user.vaiTro === 'to_truong') {
      allowedRoles = ['dan_cu'];
    }

    if (!allowedRoles.includes(newRole)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền gán vai trò này'
      });
    }

    // Không tự đổi role
    if (req.user._id.toString() === req.params.userId) {
      return res.status(403).json({
        success: false,
        message: 'Không thể tự thay đổi vai trò của chính mình'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { vaiTro: newRole },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User không tồn tại'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật vai trò thành công',
      user: {
        ...user.toObject(),
        role: user.vaiTro,
        username: user.userName
      }
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// UPDATE STATUS
router.put('/:userId/status', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { trangThai } = req.body;
    
    if (!trangThai || !['active', 'inactive'].includes(trangThai)) {
      return res.status(400).json({ 
        success: false,
        message: 'Trạng thái không hợp lệ' 
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { trangThai },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User không tồn tại' 
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật trạng thái thành công',
      user: {
        ...user.toObject(),
        role: user.vaiTro,
        username: user.userName
      }
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

module.exports = router;