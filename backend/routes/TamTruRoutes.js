const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware'); 
const TamTru = require('../models/TamTru');

// GET /api/tamtru
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, trangThai } = req.query;
    
    const query = {};
    if (trangThai) query.trangThai = trangThai;
    
    const tamTrus = await TamTru.find(query)
      .populate('nhanKhauId', 'hoTen canCuocCongDan')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort('-createdAt');
    
    const count = await TamTru.countDocuments(query);
    
    res.json({
      success: true,
      data: tamTrus,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/tamtru
router.post('/', protect, async (req, res) => {
  try {
    const tamTru = await TamTru.create(req.body);
    res.status(201).json({ success: true, data: tamTru });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/tamtru/:id
router.put('/:id', protect, authorize('admin', 'to_truong'), async (req, res) => {
  try {
    const tamTru = await TamTru.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!tamTru) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    }
    
    res.json({ success: true, data: tamTru });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE /api/tamtru/:id
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const tamTru = await TamTru.findByIdAndDelete(req.params.id);
    
    if (!tamTru) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy' });
    }
    
    res.json({ success: true, message: 'Đã xóa' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;