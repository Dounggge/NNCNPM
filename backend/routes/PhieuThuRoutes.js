const express = require('express');
const router = express.Router();
const PhieuThu = require('../models/PhieuThu');

// Get all
router.get('/', async (req, res) => {
  try {
    const { trangThai, hoKhauId, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (trangThai) query.trangThai = trangThai;
    if (hoKhauId) query.hoKhauId = hoKhauId;

    const phieuThus = await PhieuThu.find(query)
      .populate('hoKhauId', 'soHoKhau')
      .populate('khoanThuId', 'tenKhoanThu soTien')
      .populate('nguoiThuTien', 'hoTen')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await PhieuThu.countDocuments(query);

    res.json({
      data: phieuThus,
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
    const phieuThu = await PhieuThu.findById(req.params.id)
      .populate('hoKhauId')
      .populate('khoanThuId')
      .populate('nguoiThuTien');
      
    if (!phieuThu) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu thu' });
    }
    res.json(phieuThu);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Create
router.post('/', async (req, res) => {
  try {
    const phieuThu = new PhieuThu(req.body);
    await phieuThu.save();
    
    const populated = await PhieuThu.findById(phieuThu._id)
      .populate('hoKhauId')
      .populate('khoanThuId');
    
    res.status(201).json({ message: 'Tạo phiếu thu thành công', data: populated });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Update (đánh dấu đã đóng)
router.put('/:id/thanh-toan', async (req, res) => {
  try {
    const { nguoiThuTien } = req.body;
    
    const phieuThu = await PhieuThu.findByIdAndUpdate(
      req.params.id,
      {
        trangThai: 'Đã đóng',
        ngayDong: new Date(),
        nguoiThuTien
      },
      { new: true }
    ).populate('hoKhauId').populate('khoanThuId');
    
    if (!phieuThu) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu thu' });
    }
    
    res.json({ message: 'Thanh toán thành công', data: phieuThu });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Update
router.put('/:id', async (req, res) => {
  try {
    const phieuThu = await PhieuThu.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('hoKhauId').populate('khoanThuId');
    
    if (!phieuThu) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu thu' });
    }
    
    res.json({ message: 'Cập nhật thành công', data: phieuThu });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    const phieuThu = await PhieuThu.findByIdAndDelete(req.params.id);
    if (!phieuThu) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu thu' });
    }
    res.json({ message: 'Xóa thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Thống kê theo hộ khẩu
router.get('/thong-ke/ho-khau/:hoKhauId', async (req, res) => {
  try {
    const tongPhieu = await PhieuThu.countDocuments({ hoKhauId: req.params.hoKhauId });
    const daDong = await PhieuThu.countDocuments({ hoKhauId: req.params.hoKhauId, trangThai: 'Đã đóng' });
    const chuaDong = await PhieuThu.countDocuments({ hoKhauId: req.params.hoKhauId, trangThai: 'Chưa đóng' });
    
    const tongTien = await PhieuThu.aggregate([
      { $match: { hoKhauId: req.params.hoKhauId } },
      { $group: { _id: null, total: { $sum: '$soTien' } } }
    ]);

    res.json({
      tongPhieu,
      daDong,
      chuaDong,
      tongTien: tongTien[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

module.exports = router;