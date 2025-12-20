const express = require('express');
const router = express.Router();
const NhanKhau = require('../models/NhanKhau');
const { authenticate, authorize, authorizeOwnerOrAdmin } = require('../middleware/auth');

// GET ALL - Danh sách nhân khẩu
router.get('/', authenticate, authorize('admin', 'to_truong', 'ke_toan'), async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    
    let query = {};
    if (search) {
      query = {
        $or: [
          { hoTen: { $regex: search, $options: 'i' } },
          { canCuocCongDan: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const nhanKhaus = await NhanKhau.find(query)
      .populate('hoKhauId', 'soHoKhau diaChiThuongTru')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await NhanKhau.countDocuments(query);

    res.json({
      nhanKhaus,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get NhanKhau error:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET BY ID - Chi tiết nhân khẩu
// ← CHO PHÉP: Admin, Tổ trưởng, HOẶC chính user đó
router.get('/:id', authenticate, authorizeOwnerOrAdmin, async (req, res) => {
  try {
    const nhanKhau = await NhanKhau.findById(req.params.id)
      .populate('hoKhauId')
      .populate('userId', 'userName email vaiTro');

    if (!nhanKhau) {
      return res.status(404).json({ message: 'Không tìm thấy nhân khẩu' });
    }

    res.json(nhanKhau);
  } catch (error) {
    console.error('Get NhanKhau by ID error:', error);
    res.status(500).json({ message: error.message });
  }
});

// CREATE - Tạo nhân khẩu mới
// ← CHO PHÉP TẤT CẢ (để khai báo profile lần đầu)
router.post('/', authenticate, async (req, res) => {
  try {
    const nhanKhauData = {
      ...req.body,
      userId: req.user._id
    };

    const nhanKhau = new NhanKhau(nhanKhauData);
    await nhanKhau.save();

    res.status(201).json(nhanKhau);
  } catch (error) {
    console.error('Create NhanKhau error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'CCCD đã tồn tại trong hệ thống' 
      });
    }
    
    res.status(500).json({ message: error.message });
  }
});

// UPDATE - Cập nhật nhân khẩu
// ← CHO PHÉP: Admin, Tổ trưởng, HOẶC chính user đó
router.put('/:id', authenticate, authorizeOwnerOrAdmin, async (req, res) => {
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
    console.error('Update NhanKhau error:', error);
    res.status(500).json({ message: error.message });
  }
});

// DELETE - Xóa nhân khẩu
// ← CHỈ ADMIN VÀ TỔ TRƯỞNG
router.delete('/:id', authenticate, authorize('admin', 'to_truong'), async (req, res) => {
  try {
    const nhanKhau = await NhanKhau.findByIdAndDelete(req.params.id);

    if (!nhanKhau) {
      return res.status(404).json({ message: 'Không tìm thấy nhân khẩu' });
    }

    res.json({ message: 'Xóa thành công' });
  } catch (error) {
    console.error('Delete NhanKhau error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;