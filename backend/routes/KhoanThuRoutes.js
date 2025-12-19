const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware'); 
const KhoanThu = require('../models/KhoanThu');

// GET /api/khoanthu - Lấy danh sách khoản thu
router.get('/', protect, async (req, res) => {
  try {
    const khoanThus = await KhoanThu.find().sort('-createdAt');
    res.json({ success: true, data: khoanThus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/khoanthu/:id - Lấy chi tiết khoản thu
router.get('/:id', protect, async (req, res) => {
  try {
    const khoanThu = await KhoanThu.findById(req.params.id);
    
    if (!khoanThu) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khoản thu' });
    }
    
    res.json({ success: true, data: khoanThu });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/khoanthu - Tạo khoản thu
router.post('/', protect, authorize('admin', 'to_truong'), async (req, res) => {
  try {
    const khoanThu = await KhoanThu.create(req.body);
    res.status(201).json({ success: true, data: khoanThu });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/khoanthu/:id - Cập nhật khoản thu
router.put('/:id', protect, authorize('admin', 'to_truong'), async (req, res) => {
  try {
    const khoanThu = await KhoanThu.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!khoanThu) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khoản thu' });
    }
    
    res.json({ success: true, data: khoanThu });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

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