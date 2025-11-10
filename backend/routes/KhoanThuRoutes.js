const express = require('express');
const router = express.Router();
const KhoanThu = require('../models/KhoanThu');

// Get all
router.get('/', async (req, res) => {
  try {
    const { loaiThu, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (loaiThu) {
      query.loaiThu = loaiThu;
    }

    const khoanThus = await KhoanThu.find(query)
      .populate('nguoiTao', 'hoTen userName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ ngayBatDau: -1 });

    const total = await KhoanThu.countDocuments(query);

    res.json({
      data: khoanThus,
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
    const khoanThu = await KhoanThu.findById(req.params.id).populate('nguoiTao');
    if (!khoanThu) {
      return res.status(404).json({ message: 'Không tìm thấy khoản thu' });
    }
    res.json(khoanThu);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Create
router.post('/', async (req, res) => {
  try {
    const khoanThu = new KhoanThu(req.body);
    await khoanThu.save();
    res.status(201).json({ message: 'Thêm khoản thu thành công', data: khoanThu });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Update
router.put('/:id', async (req, res) => {
  try {
    const khoanThu = await KhoanThu.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!khoanThu) {
      return res.status(404).json({ message: 'Không tìm thấy khoản thu' });
    }
    
    res.json({ message: 'Cập nhật thành công', data: khoanThu });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    const khoanThu = await KhoanThu.findByIdAndDelete(req.params.id);
    if (!khoanThu) {
      return res.status(404).json({ message: 'Không tìm thấy khoản thu' });
    }
    res.json({ message: 'Xóa thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

module.exports = router;