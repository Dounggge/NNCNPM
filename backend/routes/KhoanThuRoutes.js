const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware'); 

const KhoanThu = require('../models/KhoanThu');
const Notification = require('../models/Notification');
const User = require('../models/User');

// GET /api/khoanthu - Lấy danh sách khoản thu
router.get('/', protect, async (req, res) => {
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
router.get('/:id', protect, async (req, res) => {
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
  protect,
  authorize('admin', 'to_truong'),
  async (req, res) => {
    try {
      // Whitelist dữ liệu
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

      // Lấy hộ dân để gửi thông báo
      const users = await User.find({ vaiTro: 'ho_dan' }).select('_id');

      const notifications = users.map(user => ({
        userId: user._id,
        type: 'info',
        title: 'Khoản thu mới',
        message: `Khoản thu "${khoanThu.tenKhoanThu}" đã được tạo. Số tiền: ${khoanThu.donGia.toLocaleString()} VNĐ`,
        link: `/khoan-thu/${khoanThu._id}`
      }));

      // Notification là side-effect → không để phá nghiệp vụ chính
      try {
        await Notification.insertMany(notifications);
      } catch (err) {
        console.error('Notification error:', err.message);
      }

      res.status(201).json({ success: true, data: khoanThu });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
);

// PUT /api/khoanthu/:id - Cập nhật khoản thu
router.put(
  '/:id',
  protect,
  authorize('admin', 'to_truong'),
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
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
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