const express = require('express');
const router = express.Router();
const DonXinVaoHo = require('../models/DonXinVaoHo');
const NhanKhau = require('../models/NhanKhau');
const HoKhau = require('../models/HoKhau');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');
const { createNotification } = require('../utils/notificationHelper');

// ========== HELPER: LẤY NHÂN KHẨU TỪ USER ==========
const getNhanKhauFromUser = async (userId) => {
  const user = await User.findById(userId).populate('nhanKhauId');
  return user?.nhanKhauId || null;
};

// ========== GET ALL ==========
router.get('/', authenticate, async (req, res) => {
  try {
    const { trangThai, page = 1, limit = 20 } = req.query;
    
    let query = {};
    
    // ← CHỈ ADMIN/TỔ TRƯỞNG XEM TẤT CẢ
    // DÂN CƯ CHỈ XEM ĐƠN CỦA MÌNH
    if (req.user.vaiTro === 'dan_cu') {
      query.nguoiTao = req.user._id;
    }
    
    if (trangThai) {
      query.trangThai = trangThai;
    }

    const dons = await DonXinVaoHo.find(query)
      .populate('hoKhauId', 'soHoKhau diaChiThuongTru')
      .populate('chuHoId', 'hoTen canCuocCongDan soDienThoai')
      .populate('nguoiTao', 'hoTen userName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await DonXinVaoHo.countDocuments(query);

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
    console.error('Get DonXinVaoHo error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ========== GET BY ID ==========
router.get('/:id', authenticate, async (req, res) => {
  try {
    console.log('🔍 [GET /:id] Fetching đơn:', req.params.id);

    const don = await DonXinVaoHo.findById(req.params.id)
      .populate('hoKhauId', 'soHoKhau diaChiThuongTru chuHo')
      .populate('chuHoId', 'hoTen canCuocCongDan soDienThoai')
      .populate('nguoiTao', 'hoTen userName');

    if (!don) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn'
      });
    }

    // ← KIỂM TRA QUYỀN: CHỈ NGƯỜI TẠO HOẶC ADMIN/TỔ TRƯỞNG MỚI XEM ĐƯỢC
    const isDonCuaMinh = don.nguoiTao?._id?.toString() === req.user._id.toString();
    const isAdmin = ['admin', 'to_truong'].includes(req.user.vaiTro);

    if (!isDonCuaMinh && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem đơn này'
      });
    }

    console.log('✅ [GET /:id] Đơn found:', don._id);

    res.json({
      success: true,
      data: don
    });
  } catch (error) {
    console.error('❌ [GET /:id] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ========== CREATE ==========
router.post('/', authenticate, authorize('dan_cu', 'admin', 'to_truong'), async (req, res) => {
  try {
    const { 
      hoKhauId, 
      nguoiXin,
      canCuocCongDan, 
      ngaySinh, 
      gioiTinh, 
      queQuan,
      danToc, 
      tonGiao,
      ngheNghiep,
      noiLamViec,
      soDienThoai,
      quanHeVoiChuHo,
      lyDo 
    } = req.body;

    console.log('📝 [CREATE DON] Received data:', req.body);

    // ← VALIDATE
    if (!hoKhauId || !nguoiXin || !canCuocCongDan || !queQuan || !quanHeVoiChuHo || !lyDo) {
      return res.status(400).json({ 
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc' 
      });
    }

    // ← KIỂM TRA HỘ KHẨU
    const hoKhau = await HoKhau.findById(hoKhauId).populate('chuHo');
    if (!hoKhau) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy hộ khẩu' 
      });
    }

    // ← CHỈ KIỂM TRA - KHÔNG CHẶN (CHỈ CẢNH BÁO)
    const existingNhanKhau = await NhanKhau.findOne({ canCuocCongDan });
    if (existingNhanKhau?.hoKhauId) {
      const oldHoKhau = await HoKhau.findById(existingNhanKhau.hoKhauId);
      console.log(`⚠️ [CREATE DON] CCCD ${canCuocCongDan} đã thuộc hộ ${oldHoKhau?.soHoKhau}`);
      // ← KHÔNG RETURN - CHỈ LOG WARNING
    }

    // ← TẠO ĐƠN (KHÔNG GÁN nhanKhauId)
    const don = new DonXinVaoHo({
      hoKhauId,
      chuHoId: hoKhau.chuHo._id,
      thongTinNguoiXin: {
        hoTen: nguoiXin,
        canCuocCongDan,
        ngaySinh,
        gioiTinh,
        queQuan,
        danToc,
        tonGiao,
        ngheNghiep,
        noiLamViec,
        soDienThoai
      },
      quanHeVoiChuHo,
      lyDo,
      nhanKhauId: null, // ← BỎ: existingNhanKhau?._id
      nguoiTao: req.user._id,
      trangThai: 'cho_duyet' // ← GIỮ TRẠNG THÁI (ĐỂ FILTER)
    });

    await don.save();
    console.log('✅ [CREATE DON] Đơn created:', don._id);

    // ← GỬI THÔNG BÁO
    const admins = await User.find({ 
      vaiTro: { $in: ['admin', 'to_truong'] },
      trangThai: 'active'
    });

    const notificationMessage = `${nguoiXin} (${canCuocCongDan}) xin vào hộ ${hoKhau.soHoKhau} với vai trò: ${quanHeVoiChuHo}. Chủ hộ: ${hoKhau.chuHo.hoTen}`;

    for (const admin of admins) {
      await createNotification(
        admin._id,
        'info',
        'Đơn xin vào hộ mới',
        notificationMessage,
        `/dashboard/donxinvaoho/${don._id}`
      );
    }

    console.log(`📢 [CREATE DON] Sent notifications to ${admins.length} admins`);

    res.status(201).json({
      success: true,
      data: don,
      message: existingNhanKhau?.hoKhauId
        ? '⚠️ Đã gửi đơn. Lưu ý: CCCD này đã thuộc hộ khác, tổ trưởng sẽ xem xét.'
        : '✅ Đã gửi đơn thành công! Tổ trưởng sẽ xem và thêm vào hộ khẩu.'
    });
  } catch (error) {
    console.error('❌ [CREATE DON] Error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ========== DELETE (CHỈ XÓA ĐƠN CỦA MÌNH) ==========
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const don = await DonXinVaoHo.findById(req.params.id);

    if (!don) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy đơn' 
      });
    }

    // ← CHỈ NGƯỜI TẠO HOẶC ADMIN MỚI XÓA ĐƯỢC
    const isDonCuaMinh = don.nguoiTao.toString() === req.user._id.toString();
    const isAdmin = ['admin', 'to_truong'].includes(req.user.vaiTro);

    if (!isDonCuaMinh && !isAdmin) {
      return res.status(403).json({ 
        success: false,
        message: 'Bạn không có quyền xóa đơn này' 
      });
    }

    await DonXinVaoHo.findByIdAndDelete(req.params.id);

    res.json({ 
      success: true,
      message: 'Đã xóa đơn' 
    });
  } catch (error) {
    console.error('Delete DonXinVaoHo error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

module.exports = router;