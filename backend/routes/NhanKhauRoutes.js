const express = require('express');
const router = express.Router();
const NhanKhau = require('../models/NhanKhau');
const { authenticate, authorize, checkPermission } = require('../middleware/auth');

// GET - Lấy danh sách nhân khẩu
// Ai cũng xem được (đã đăng nhập)
router.get('/', authenticate, checkPermission('nhankhau:read'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    let query = {};
    
    // Nếu là dân cư thường, chỉ xem được thông tin của mình
    if (req.user.vaiTro === 'dan_cu') {
      query._id = req.user.nhanKhauId;
    }
    
    // Nếu là chủ hộ, xem được thành viên trong hộ
    if (req.user.vaiTro === 'chu_ho' && req.user.nhanKhauId?.hoKhauId) {
      query.hoKhauId = req.user.nhanKhauId.hoKhauId;
    }

    // Search
    if (search) {
      query.$or = [
        { hoTen: { $regex: search, $options: 'i' } },
        { canCuocCongDan: { $regex: search, $options: 'i' } }
      ];
    }

    const nhanKhaus = await NhanKhau.find(query)
      .populate('hoKhauId')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await NhanKhau.countDocuments(query);

    res.json({
      data: nhanKhaus,
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

// GET - Chi tiết nhân khẩu
router.get('/:id', authenticate, checkPermission('nhankhau:read'), async (req, res) => {
  try {
    const nhanKhau = await NhanKhau.findById(req.params.id).populate('hoKhauId');
    
    if (!nhanKhau) {
      return res.status(404).json({ message: 'Không tìm thấy nhân khẩu' });
    }

    // Kiểm tra quyền xem
    if (req.user.vaiTro === 'dan_cu') {
      if (nhanKhau._id.toString() !== req.user.nhanKhauId?.toString()) {
        return res.status(403).json({ message: 'Bạn không có quyền xem thông tin này' });
      }
    }

    res.json(nhanKhau);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// POST - Thêm nhân khẩu mới
// Chỉ admin, tổ trưởng
router.post('/', authenticate, checkPermission('nhankhau:create'), async (req, res) => {
  try {
    const nhanKhau = new NhanKhau(req.body);
    await nhanKhau.save();
    
    console.log('✅ Created NhanKhau:', nhanKhau._id);
    res.status(201).json(nhanKhau);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// PUT - Cập nhật nhân khẩu
// Admin, tổ trưởng
router.put('/:id', authenticate, checkPermission('nhankhau:update'), async (req, res) => {
  try {
    const nhanKhau = await NhanKhau.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!nhanKhau) {
      return res.status(404).json({ message: 'Không tìm thấy nhân khẩu' });
    }

    res.json(nhanKhau);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// DELETE - Xóa nhân khẩu
// Chỉ admin
router.delete('/:id', authenticate, checkPermission('nhankhau:delete'), async (req, res) => {
  try {
    const nhanKhau = await NhanKhau.findByIdAndDelete(req.params.id);
    
    if (!nhanKhau) {
      return res.status(404).json({ message: 'Không tìm thấy nhân khẩu' });
    }

    console.log('✅ Deleted NhanKhau:', req.params.id);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

module.exports = router;