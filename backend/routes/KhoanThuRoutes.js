const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth'); // ← SỬA ĐÂY

const KhoanThu = require('../models/KhoanThu');
const Notification = require('../models/Notification');
const User = require('../models/User');

// GET /api/khoanthu - Lấy danh sách khoản thu
router.get('/', authenticate, async (req, res) => { // ← SỬA: protect → authenticate
  try {
    const khoanThus = await KhoanThu.find()
      .sort('-createdAt')
      .populate('nguoiTao', 'hoTen');

    res.json({ success: true, data: khoanThus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/khoanthu/:id - Lấy chi tiết khoản thu
router.get('/:id', authenticate, async (req, res) => { // ← SỬA
  try {
    const khoanThu = await KhoanThu.findById(req.params.id)
      .populate('nguoiTao', 'hoTen');

    if (!khoanThu) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khoản thu'
      });
    }

    res.json({ success: true, data: khoanThu });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/khoanthu - Tạo khoản thu
router.post(
  '/',
  authenticate, // ← SỬA: protect → authenticate
  authorize('admin', 'to_truong', 'ke_toan'), // ← GIỮ NGUYÊN
  async (req, res) => {
    try {
      const {
        tenKhoanThu,
        loaiKhoanThu,
        donGia,
        donVi,
        batDau,
        ketThuc,
        moTa
      } = req.body;

      const khoanThu = await KhoanThu.create({
        tenKhoanThu,
        loaiKhoanThu,
        donGia,
        donVi,
        batDau,
        ketThuc,
        moTa,
        nguoiTao: req.user._id
      });

      // ⭐ GỬI THÔNG BÁO CHO TẤT CẢ USER (KHÔNG CHỈ HỘ DÂN)
      const allUsers = await User.find({ 
        trangThai: 'active' // ← CHỈ LẤY USER ĐANG ACTIVE
      }).select('_id');

      const notifications = allUsers.map(user => ({
        userId: user._id,
        type: 'info', // ← QUAN TRỌNG: PHẢI LÀ 'info', 'success', 'warning', hoặc 'error'
        title: '🔔 Khoản thu mới',
        message: `Khoản thu "${khoanThu.tenKhoanThu}" đã được tạo. Số tiền: ${khoanThu.donGia.toLocaleString()} VNĐ/${khoanThu.donVi}`,
        link: `/dashboard/khoanthu`
      }));

      try {
        await Notification.insertMany(notifications);
        console.log(`✅ Đã gửi ${notifications.length} thông báo`);
      } catch (err) {
        console.error('❌ Notification error:', err.message);
      }

      res.status(201).json({ 
        success: true, 
        data: khoanThu,
        message: '✅ Tạo khoản thu thành công!'
      });
    } catch (error) {
      console.error('Create KhoanThu error:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }
);

// PUT /api/khoanthu/:id - Cập nhật khoản thu
router.put(
  '/:id',
  authenticate, // ← SỬA
  authorize('admin', 'to_truong', 'ke_toan'),
  async (req, res) => {
    try {
      const allowedFields = ['tenKhoanThu', 'moTa', 'ketThuc'];
      const updateData = {};

      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });

      const khoanThu = await KhoanThu.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!khoanThu) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy khoản thu'
        });
      }

      res.json({ success: true, data: khoanThu });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
);

// DELETE /api/khoanthu/:id - Xóa khoản thu
router.delete('/:id', authenticate, authorize('admin', 'to_truong', 'ke_toan'), async (req, res) => { // ← SỬA
  try {
    const khoanThu = await KhoanThu.findByIdAndDelete(req.params.id);
    
    if (!khoanThu) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khoản thu' });
    }
    
    res.json({ success: true, message: 'Đã xóa khoản thu' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;