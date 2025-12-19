const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const PhieuThu = require('../models/PhieuThu');

// GET /api/phieuthu - Lấy danh sách phiếu thu
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, trangThai } = req.query;
    
    const query = {};
    if (trangThai) query.trangThai = trangThai;
    
    const phieuThus = await PhieuThu.find(query)
      .populate('hoKhauId', 'soHoKhau diaChiThuongTru')
      .populate('cacKhoanThu', 'tenKhoanThu donGia')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort('-createdAt');
    
    const count = await PhieuThu.countDocuments(query);
    
    res.json({
      success: true,
      data: phieuThus,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/phieuthu - Tạo phiếu thu
router.post('/', protect, authorize('admin', 'to_truong', 'thu_quy'), async (req, res) => {
  try {
    const phieuThu = await PhieuThu.create(req.body);
    res.status(201).json({ success: true, data: phieuThu });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/phieuthu/:id/paid - Đánh dấu đã thanh toán
router.put('/:id/paid', protect, authorize('admin', 'to_truong', 'thu_quy'), async (req, res) => {
  try {
    const { ngayThanhToan, hinhThucThanhToan } = req.body;
    
    const phieuThu = await PhieuThu.findByIdAndUpdate(
      req.params.id,
      { 
        trangThai: 'da_dong',
        ngayThanhToan,
        hinhThucThanhToan
      },
      { new: true, runValidators: true }
    );
    
    if (!phieuThu) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phiếu thu' });
    }
    
    res.json({ success: true, data: phieuThu });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE /api/phieuthu/:id - Xóa phiếu thu
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const phieuThu = await PhieuThu.findByIdAndDelete(req.params.id);
    
    if (!phieuThu) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phiếu thu' });
    }
    
    res.json({ success: true, message: 'Đã xóa phiếu thu' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;