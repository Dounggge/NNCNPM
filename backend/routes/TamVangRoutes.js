const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const TamVang = require('../models/TamVang');

// GET /api/tamvang - Lấy danh sách tạm vắng
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, trangThai } = req.query;
    
    const query = {};
    if (trangThai) query.trangThai = trangThai;
    
    const tamVangs = await TamVang.find(query)
      .populate('nhanKhauId', 'hoTen canCuocCongDan')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort('-createdAt');
    
    const count = await TamVang.countDocuments(query);
    
    res.json({
      success: true,
      data: tamVangs,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/tamvang - Tạo đơn tạm vắng
router.post('/', protect, async (req, res) => {
  try {
    const tamVang = await TamVang.create(req.body);
    res.status(201).json({ success: true, data: tamVang });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/tamvang/:id - Cập nhật
router.put('/:id', protect, authorize('admin', 'to_truong'), async (req, res) => {
  try {
    const tamVang = await TamVang.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!tamVang) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn tạm vắng' });
    }
    
    res.json({ success: true, data: tamVang });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE /api/tamvang/:id - Xóa
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const tamVang = await TamVang.findByIdAndDelete(req.params.id);
    
    if (!tamVang) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn tạm vắng' });
    }
    
    res.json({ success: true, message: 'Đã xóa đơn tạm vắng' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;