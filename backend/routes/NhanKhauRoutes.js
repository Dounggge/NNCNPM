const express = require('express');
const router = express.Router();
const NhanKhau = require('../models/NhanKhau');

// Get all
router.get('/', async (req, res) => {
  try {
    const { search, gioiTinh, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (search) {
      query.$or = [
        { hoTen: { $regex: search, $options: 'i' } },
        { cmnd: { $regex: search, $options: 'i' } }
      ];
    }
    if (gioiTinh) {
      query.gioiTinh = gioiTinh;
    }

    const nhanKhaus = await NhanKhau.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await NhanKhau.countDocuments(query);

    res.json({
      data: nhanKhaus,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Get by ID
router.get('/:id', async (req, res) => {
  try {
    const nhanKhau = await NhanKhau.findById(req.params.id);
    if (!nhanKhau) {
      return res.status(404).json({ message: 'Không tìm thấy nhân khẩu' });
    }
    res.json(nhanKhau);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Create
router.post('/', async (req, res) => {
  try {
    const nhanKhau = new NhanKhau(req.body);
    await nhanKhau.save();
    res.status(201).json({ message: 'Thêm nhân khẩu thành công', data: nhanKhau });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'CMND đã tồn tại' });
    }
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Update
router.put('/:id', async (req, res) => {
  try {
    const nhanKhau = await NhanKhau.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!nhanKhau) {
      return res.status(404).json({ message: 'Không tìm thấy nhân khẩu' });
    }
    
    res.json({ message: 'Cập nhật thành công', data: nhanKhau });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    const nhanKhau = await NhanKhau.findByIdAndDelete(req.params.id);
    if (!nhanKhau) {
      return res.status(404).json({ message: 'Không tìm thấy nhân khẩu' });
    }
    res.json({ message: 'Xóa thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

module.exports = router;