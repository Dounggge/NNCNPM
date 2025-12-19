const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const User = require('../models/User');

// GET /api/users - Lấy danh sách users
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('nhanKhauId', 'hoTen canCuocCongDan')
      .sort('-createdAt');
    
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/users/:userId/role - Cập nhật role
router.put('/:userId/role', protect, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User không tồn tại' });
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/users/:userId/status - Cập nhật status
router.put('/:userId/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { status },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User không tồn tại' });
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/users/:userId/link-profile - Link với nhân khẩu
router.put('/:userId/link-profile', protect, authorize('admin'), async (req, res) => {
  try {
    const { nhanKhauId } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { nhanKhauId },
      { new: true, runValidators: true }
    )
      .select('-password')
      .populate('nhanKhauId', 'hoTen canCuocCongDan');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User không tồn tại' });
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;