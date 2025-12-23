const express = require('express');
const router = express.Router();
const TamVang = require('../models/TamVang');
const NhanKhau = require('../models/NhanKhau');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');
const { createNotification } = require('../utils/notificationHelper');

// ========== GET ALL ==========
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, trangThai } = req.query;
    
    let query = {};
    
    // ← DÂN CƯ CHỈ XEM ĐƠN CỦA MÌNH
    if (req.user.vaiTro === 'dan_cu') {
      const userWithProfile = await User.findById(req.user._id).populate('nhanKhauId');
      const nhanKhauId = userWithProfile?.nhanKhauId?._id;
      
      if (nhanKhauId) {
        query.nhanKhauId = nhanKhauId;
      } else {
        return res.json({
          success: true,
          data: [],
          pagination: { total: 0, totalPages: 0, currentPage: 1, limit: parseInt(limit) }
        });
      }
    }
    
    if (trangThai) query.trangThai = trangThai;
    
    const tamVangs = await TamVang.find(query)
      .populate('nhanKhauId', 'hoTen canCuocCongDan soDienThoai')
      .populate('nguoiDuyet', 'hoTen userName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const count = await TamVang.countDocuments(query);
    
    res.json({
      success: true,
      data: tamVangs,
      pagination: {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get TamVang error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== GET BY ID ==========
router.get('/:id', authenticate, async (req, res) => {
  try {
    const tamVang = await TamVang.findById(req.params.id)
      .populate('nhanKhauId', 'hoTen canCuocCongDan ngaySinh gioiTinh soDienThoai')
      .populate('nguoiDuyet', 'hoTen userName');
    
    if (!tamVang) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn tạm vắng' });
    }
    
    // ← KIỂM TRA QUYỀN
    if (req.user.vaiTro === 'dan_cu') {
      const userWithProfile = await User.findById(req.user._id).populate('nhanKhauId');
      const nhanKhauId = userWithProfile?.nhanKhauId?._id;
      
      if (tamVang.nhanKhauId._id.toString() !== nhanKhauId?.toString()) {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền xem đơn này' });
      }
    }
    
    res.json({ success: true, data: tamVang });
  } catch (error) {
    console.error('Get TamVang by ID error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== CREATE ==========
router.post('/', authenticate, async (req, res) => {
  try {
    const { nhanKhauId, noiDen, tuNgay, denNgay, lyDo, ghiChu } = req.body;
    
    // ← VALIDATE
    if (!nhanKhauId || !noiDen || !tuNgay || !denNgay || !lyDo) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc' 
      });
    }
    
    // ← KIỂM TRA NHÂN KHẨU
    const nhanKhau = await NhanKhau.findById(nhanKhauId);
    if (!nhanKhau) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy nhân khẩu' });
    }
    
    // ← TẠO ĐƠN
    const tamVang = await TamVang.create({
      nhanKhauId,
      noiDen,
      tuNgay,
      denNgay,
      lyDo,
      ghiChu,
      trangThai: 'cho_duyet'
    });
    
    // ← GỬI THÔNG BÁO
    const admins = await User.find({ 
      vaiTro: { $in: ['admin', 'to_truong'] },
      trangThai: 'active'
    });
    
    for (const admin of admins) {
      await createNotification(
        admin._id,
        'info',
        'Đơn tạm vắng mới',
        `${nhanKhau.hoTen} (${nhanKhau.canCuocCongDan}) đăng ký tạm vắng đến ${noiDen} từ ${new Date(tuNgay).toLocaleDateString('vi-VN')} đến ${new Date(denNgay).toLocaleDateString('vi-VN')}`,
        `/dashboard/tamvang/${tamVang._id}`
      );
    }
    
    res.status(201).json({ 
      success: true, 
      data: tamVang,
      message: '✅ Đã gửi đơn tạm vắng thành công!'
    });
  } catch (error) {
    console.error('Create TamVang error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// ========== DELETE ==========
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const tamVang = await TamVang.findById(req.params.id);
    
    if (!tamVang) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn' });
    }
    
    // ← CHỈ ADMIN HOẶC NGƯỜI TẠO MỚI XÓA ĐƯỢC
    if (req.user.vaiTro === 'dan_cu') {
      const userWithProfile = await User.findById(req.user._id).populate('nhanKhauId');
      const nhanKhauId = userWithProfile?.nhanKhauId?._id;
      
      if (tamVang.nhanKhauId.toString() !== nhanKhauId?.toString()) {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa đơn này' });
      }
    }
    
    await TamVang.findByIdAndDelete(req.params.id);
    
    res.json({ success: true, message: 'Đã xóa đơn tạm vắng' });
  } catch (error) {
    console.error('Delete TamVang error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;