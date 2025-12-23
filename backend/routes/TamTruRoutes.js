const express = require('express');
const router = express.Router();
const TamTru = require('../models/TamTru');
const NhanKhau = require('../models/NhanKhau');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');
const { createNotification } = require('../utils/notificationHelper');

// ========== GET ALL ==========
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, trangThai, search } = req.query;
    
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
    
    const tamTrus = await TamTru.find(query)
      .populate('nhanKhauId', 'hoTen canCuocCongDan soDienThoai')
      .populate('nguoiDuyet', 'hoTen userName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const count = await TamTru.countDocuments(query);
    
    res.json({
      success: true,
      data: tamTrus,
      pagination: {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get TamTru error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== GET BY ID ==========
router.get('/:id', authenticate, async (req, res) => {
  try {
    const tamTru = await TamTru.findById(req.params.id)
      .populate('nhanKhauId', 'hoTen canCuocCongDan ngaySinh gioiTinh soDienThoai')
      .populate('nguoiDuyet', 'hoTen userName');
    
    if (!tamTru) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn tạm trú' });
    }
    
    // ← KIỂM TRA QUYỀN
    if (req.user.vaiTro === 'dan_cu') {
      const userWithProfile = await User.findById(req.user._id).populate('nhanKhauId');
      const nhanKhauId = userWithProfile?.nhanKhauId?._id;
      
      if (tamTru.nhanKhauId._id.toString() !== nhanKhauId?.toString()) {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền xem đơn này' });
      }
    }
    
    res.json({ success: true, data: tamTru });
  } catch (error) {
    console.error('Get TamTru by ID error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== CREATE ==========
router.post('/', authenticate, async (req, res) => {
  try {
    const { nhanKhauId, diaChiTamTru, tuNgay, denNgay, lyDo, ghiChu } = req.body;
    
    // ← VALIDATE
    if (!nhanKhauId || !diaChiTamTru || !tuNgay || !denNgay || !lyDo) {
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
    const tamTru = await TamTru.create({
      nhanKhauId,
      diaChiTamTru,
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
        'Đơn tạm trú mới',
        `${nhanKhau.hoTen} (${nhanKhau.canCuocCongDan}) đăng ký tạm trú tại ${diaChiTamTru} từ ${new Date(tuNgay).toLocaleDateString('vi-VN')} đến ${new Date(denNgay).toLocaleDateString('vi-VN')}`,
        `/dashboard/tamtru/${tamTru._id}`
      );
    }
    
    res.status(201).json({ 
      success: true, 
      data: tamTru,
      message: '✅ Đã gửi đơn tạm trú thành công!'
    });
  } catch (error) {
    console.error('Create TamTru error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// ========== DELETE ==========
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const tamTru = await TamTru.findById(req.params.id);
    
    if (!tamTru) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn' });
    }
    
    // ← CHỈ ADMIN HOẶC NGƯỜI TẠO MỚI XÓA ĐƯỢC
    if (req.user.vaiTro === 'dan_cu') {
      const userWithProfile = await User.findById(req.user._id).populate('nhanKhauId');
      const nhanKhauId = userWithProfile?.nhanKhauId?._id;
      
      if (tamTru.nhanKhauId.toString() !== nhanKhauId?.toString()) {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa đơn này' });
      }
    }
    
    await TamTru.findByIdAndDelete(req.params.id);
    
    res.json({ success: true, message: 'Đã xóa đơn tạm trú' });
  } catch (error) {
    console.error('Delete TamTru error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;