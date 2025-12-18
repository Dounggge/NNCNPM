const express = require('express');
const router = express.Router();
const HoKhau = require('../models/HoKhau');
const NhanKhau = require('../models/NhanKhau');
const { authenticate, checkPermission } = require('../middleware/auth');

// GET - Danh sách hộ khẩu
router.get('/', authenticate, checkPermission('hokhau:read'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    let query = {};

    // Chủ hộ chỉ xem được hộ của mình
    if (req.user.vaiTro === 'chu_ho' && req.user.nhanKhauId?.hoKhauId) {
      query._id = req.user.nhanKhauId.hoKhauId;
    }

    if (search) {
      query.$or = [
        { soHoKhau: { $regex: search, $options: 'i' } },
        { diaChi: { $regex: search, $options: 'i' } }
      ];
    }

    const hoKhaus = await HoKhau.find(query)
      .populate('chuHoId')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await HoKhau.countDocuments(query);

    res.json({
      data: hoKhaus,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// GET - Chi tiết hộ khẩu với danh sách thành viên
router.get('/:id', authenticate, checkPermission('hokhau:read'), async (req, res) => {
  try {
    const hoKhau = await HoKhau.findById(req.params.id).populate('chuHoId');
    
    if (!hoKhau) {
      return res.status(404).json({ message: 'Không tìm thấy hộ khẩu' });
    }

    // Lấy danh sách thành viên
    const thanhVien = await NhanKhau.find({ hoKhauId: hoKhau._id });

    res.json({
      ...hoKhau.toObject(),
      thanhVien
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// POST - Tạo hộ khẩu mới
router.post('/', authenticate, checkPermission('hokhau:create'), async (req, res) => {
  try {
    const hoKhau = new HoKhau(req.body);
    await hoKhau.save();
    
    console.log('✅ Created HoKhau:', hoKhau._id);
    res.status(201).json(hoKhau);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// PUT - Cập nhật hộ khẩu
router.put('/:id', authenticate, checkPermission('hokhau:update'), async (req, res) => {
  try {
    const hoKhau = await HoKhau.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!hoKhau) {
      return res.status(404).json({ message: 'Không tìm thấy hộ khẩu' });
    }

    res.json(hoKhau);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// DELETE - Xóa hộ khẩu
router.delete('/:id', authenticate, checkPermission('hokhau:delete'), async (req, res) => {
  try {
    const hoKhau = await HoKhau.findByIdAndDelete(req.params.id);
    
    if (!hoKhau) {
      return res.status(404).json({ message: 'Không tìm thấy hộ khẩu' });
    }

    // Cập nhật nhân khẩu trong hộ
    await NhanKhau.updateMany(
      { hoKhauId: req.params.id },
      { $unset: { hoKhauId: 1 } }
    );

    console.log('✅ Deleted HoKhau:', req.params.id);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

module.exports = router;