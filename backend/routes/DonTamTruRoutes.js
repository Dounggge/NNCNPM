const express = require('express');
const router = express.Router();
const DonTamTru = require('../models/DonTamTru');
const NhanKhau = require('../models/NhanKhau');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');
const { createNotification } = require('../utils/notificationHelper');

// ========== GET ALL ĐƠN ==========
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, trangThai } = req.query;
    
    let query = {};
    
    // ← DÂN CƯ CHỈ XEM ĐƠN CỦA MÌNH
    if (req.user.vaiTro === 'dan_cu') {
      query.nguoiTao = req.user._id;
    }
    
    if (trangThai) query.trangThai = trangThai;
    
    const dons = await DonTamTru.find(query)
      .populate('nhanKhauId', 'hoTen canCuocCongDan soDienThoai')
      .populate('nguoiTao', 'hoTen userName')
      .populate('nguoiXuLy', 'hoTen userName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const count = await DonTamTru.countDocuments(query);
    
    res.json({
      success: true,
      data: dons,
      pagination: {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get DonTamTru error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== GET BY ID ==========
router.get('/:id', authenticate, async (req, res) => {
  try {
    const don = await DonTamTru.findById(req.params.id)
      .populate('nhanKhauId', 'hoTen canCuocCongDan ngaySinh gioiTinh soDienThoai')
      .populate('nguoiTao', 'hoTen userName')
      .populate('nguoiXuLy', 'hoTen userName');
    
    if (!don) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn' });
    }
    
    // ← KIỂM TRA QUYỀN
    const isDonCuaMinh = don.nguoiTao._id.toString() === req.user._id.toString();
    const isAdmin = ['admin', 'to_truong'].includes(req.user.vaiTro);
    
    if (!isDonCuaMinh && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xem đơn này' });
    }
    
    res.json({ success: true, data: don });
  } catch (error) {
    console.error('Get DonTamTru by ID error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== CREATE ĐƠN ==========
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
    const don = await DonTamTru.create({
      nhanKhauId,
      diaChiTamTru,
      tuNgay,
      denNgay,
      lyDo,
      ghiChu,
      nguoiTao: req.user._id,
      trangThai: 'cho_xu_ly'
    });
    
    // ← GỬI THÔNG BÁO CHO TỔ TRƯỞNG/ADMIN
    const admins = await User.find({ 
      vaiTro: { $in: ['admin', 'to_truong'] },
      trangThai: 'active'
    });
    
    for (const admin of admins) {
      await createNotification(
        admin._id,
        'info',
        '📋 Đơn đăng ký tạm trú mới',
        `${nhanKhau.hoTen} (${nhanKhau.canCuocCongDan}) đăng ký tạm trú tại ${diaChiTamTru} từ ${new Date(tuNgay).toLocaleDateString('vi-VN')} đến ${new Date(denNgay).toLocaleDateString('vi-VN')}. Vui lòng kiểm tra và thêm vào danh sách tạm trú chính thức.`,
        `/dashboard/don-tamtru/${don._id}`
      );
    }
    
    console.log(`✅ Đã gửi thông báo đơn tạm trú đến ${admins.length} tổ trưởng`);
    
    res.status(201).json({ 
      success: true, 
      data: don,
      message: '✅ Đã gửi đơn đăng ký tạm trú! Tổ trưởng sẽ xem xét và thêm vào danh sách chính thức.'
    });
  } catch (error) {
    console.error('Create DonTamTru error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// ========== MARK AS PROCESSED (Tổ trưởng đánh dấu đã xử lý) ==========
router.patch('/:id/xu-ly', authenticate, authorize('admin', 'to_truong'), async (req, res) => {
  try {
    const don = await DonTamTru.findById(req.params.id);
    
    if (!don) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn' });
    }
    
    don.trangThai = 'da_xu_ly';
    don.nguoiXuLy = req.user._id;
    don.ngayXuLy = new Date();
    await don.save();
    
    res.json({ 
      success: true, 
      data: don,
      message: 'Đã đánh dấu đơn là đã xử lý' 
    });
  } catch (error) {
    console.error('Mark as processed error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== DELETE ==========
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const don = await DonTamTru.findById(req.params.id);
    
    if (!don) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn' });
    }
    
    // ← CHỈ NGƯỜI TẠO HOẶC ADMIN MỚI XÓA ĐƯỢC
    const isDonCuaMinh = don.nguoiTao.toString() === req.user._id.toString();
    const isAdmin = ['admin', 'to_truong'].includes(req.user.vaiTro);
    
    if (!isDonCuaMinh && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa đơn này' });
    }
    
    await DonTamTru.findByIdAndDelete(req.params.id);
    
    res.json({ success: true, message: 'Đã xóa đơn' });
  } catch (error) {
    console.error('Delete DonTamTru error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;