const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { authenticate, authorize } = require('../middleware/auth');
const PhieuThu = require('../models/PhieuThu');
const KhoanThu = require('../models/KhoanThu');
const HoKhau = require('../models/HoKhau');
const NhanKhau = require('../models/NhanKhau');

// ========== GET ALL PHIẾU THU (PHÂN QUYỀN THEO HỘ KHẨU) ==========
router.get('/', authenticate, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      trangThai, 
      thang, 
      nam,
      search 
    } = req.query;
    
    const query = {};
    
    // ← FIX: PHÂN QUYỀN CHẶT CHẼ HơN
    if (!['admin', 'to_truong', 'ke_toan'].includes(req.user.vaiTro)) {
      console.log('🔒 [PHIEU THU] Non-admin user:', req.user.userName, req.user.vaiTro);
      
      // ← KIỂM TRA USER CÓ nhanKhauId KHÔNG
      if (!req.user.nhanKhauId) {
        console.log('❌ [PHIEU THU] User không có nhanKhauId');
        return res.json({
          success: true,
          data: [],
          message: 'Bạn chưa được liên kết với nhân khẩu nào',
          pagination: { total: 0, page: parseInt(page), limit: parseInt(limit), totalPages: 0 }
        });
      }
      
      // ← LẤY THÔNG TIN NHÂN KHẨU
      const nhanKhau = await NhanKhau.findById(req.user.nhanKhauId).select('hoKhauId');
      
      if (!nhanKhau) {
        console.log('❌ [PHIEU THU] Không tìm thấy nhân khẩu');
        return res.json({
          success: true,
          data: [],
          message: 'Không tìm thấy thông tin nhân khẩu',
          pagination: { total: 0, page: parseInt(page), limit: parseInt(limit), totalPages: 0 }
        });
      }
      
      if (!nhanKhau.hoKhauId) {
        console.log('❌ [PHIEU THU] Nhân khẩu chưa thuộc hộ khẩu nào');
        return res.json({
          success: true,
          data: [],
          message: 'Bạn chưa thuộc hộ khẩu nào',
          pagination: { total: 0, page: parseInt(page), limit: parseInt(limit), totalPages: 0 }
        });
      }
      
      // ← CHỈ LẤY PHIẾU THU CỦA HỘ KHẨU MÌNH
      query.hoKhauId = nhanKhau.hoKhauId;
      console.log(`✅ [PHIEU THU] Filtered by hoKhauId: ${nhanKhau.hoKhauId}`);
    } else {
      console.log('👑 [PHIEU THU] Admin/Tổ trưởng/Kế toán - Xem tất cả');
    }
    
    if (trangThai) query.trangThai = trangThai;
    if (thang) query.thang = parseInt(thang);
    if (nam) query.nam = parseInt(nam);
    
    // ← XỬ LÝ SEARCH
    if (search && search.trim() !== '') {
      const hoKhaus = await HoKhau.find({
        $or: [
          { soHoKhau: { $regex: search, $options: 'i' } },
        ]
      }).select('_id');
      
      if (hoKhaus.length > 0) {
        if (query.hoKhauId) {
          // ← NẾU ĐÃ CÓ FILTER HỘ KHẨU (user thường), PHẢI NẰM TRONG DANH SÁCH
          const allowedIds = hoKhaus.map(h => h._id.toString());
          if (!allowedIds.includes(query.hoKhauId.toString())) {
            return res.json({
              success: true,
              data: [],
              pagination: { total: 0, page: parseInt(page), limit: parseInt(limit), totalPages: 0 }
            });
          }
        } else {
          // ← ADMIN: TÌM TRONG TẤT CẢ HỘ KHẨU
          query.hoKhauId = { $in: hoKhaus.map(h => h._id) };
        }
      } else {
        return res.json({
          success: true,
          data: [],
          pagination: { total: 0, page: parseInt(page), limit: parseInt(limit), totalPages: 0 }
        });
      }
    }
    
    console.log('🔍 [PHIEU THU] Final query:', JSON.stringify(query));
    
    const total = await PhieuThu.countDocuments(query);
    
    const phieuThus = await PhieuThu.find(query)
      .populate({
        path: 'hoKhauId',
        select: 'soHoKhau diaChiThuongTru chuHo',
        populate: { path: 'chuHo', select: 'hoTen' }
      })
      .populate('khoanThuId', 'tenKhoanThu donGia donVi')
      .populate('nguoiThuTien', 'hoTen')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });
    
    console.log(`📋 [PHIEU THU] Found ${phieuThus.length}/${total} phiếu thu`);
    
    res.json({
      success: true,
      data: phieuThus,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ [PHIEU THU] Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Lỗi server' 
    });
  }
});

// ========== GET CHI TIẾT 1 PHIẾU THU (KIỂM TRA QUYỀN) ==========
router.get('/:id', authenticate, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID phiếu thu không hợp lệ' 
      });
    }
    
    const phieuThu = await PhieuThu.findById(req.params.id)
      .populate({
        path: 'hoKhauId',
        select: 'soHoKhau diaChiThuongTru chuHo',
        populate: { path: 'chuHo', select: 'hoTen canCuocCongDan' }
      })
      .populate('khoanThuId', 'tenKhoanThu donGia donVi')
      .populate('nguoiThuTien', 'hoTen email');
    
    if (!phieuThu) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy phiếu thu' 
      });
    }
    
    // ← KIỂM TRA QUYỀN XEM: CHỈ NGƯỜI TRONG HỘ KHẨU MỚI XEM ĐƯỢC
    if (!['admin', 'to_truong', 'ke_toan'].includes(req.user.vaiTro)) {
      const nhanKhau = await NhanKhau.findById(req.user.nhanKhauId);
      
      if (!nhanKhau || !nhanKhau.hoKhauId) {
        return res.status(403).json({ 
          success: false, 
          message: '❌ Bạn chưa thuộc hộ khẩu nào' 
        });
      }
      
      if (nhanKhau.hoKhauId.toString() !== phieuThu.hoKhauId._id.toString()) {
        return res.status(403).json({ 
          success: false, 
          message: '❌ Bạn không có quyền xem phiếu thu này' 
        });
      }
    }
    
    res.json({ success: true, data: phieuThu });
  } catch (error) {
    console.error('❌ Error fetching detail:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== TẠO PHIẾU THU ==========
router.post('/', authenticate, authorize('admin', 'to_truong', 'ke_toan'), async (req, res) => {
  try {
    const { hoKhauId, khoanThuIds, khoanThuId, thang, nam, hanThanhToan, ghiChu } = req.body;

    console.log('📝 [CREATE PHIEU THU] Request body:', req.body);

    if (!hoKhauId) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin hộ khẩu' });
    }

    // ← HỖ TRỢ CẢ khoanThuIds (array) VÀ khoanThuId (single)
    let selectedKhoanThuIds = [];
    
    if (khoanThuIds && Array.isArray(khoanThuIds)) {
      selectedKhoanThuIds = khoanThuIds;
    } else if (khoanThuId) {
      selectedKhoanThuIds = [khoanThuId];
    }

    if (selectedKhoanThuIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn ít nhất 1 khoản thu' });
    }

    console.log('🔍 Selected khoanThuIds:', selectedKhoanThuIds);

    // ← LẤY THÔNG TIN CÁC KHOẢN THU
    const khoanThus = await KhoanThu.find({ _id: { $in: selectedKhoanThuIds } });
    
    if (khoanThus.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khoản thu nào' });
    }

    // ← TÍNH TỔNG TIỀN
    const tongTien = khoanThus.reduce((sum, kt) => sum + kt.donGia, 0);

    // ← TẠO PHIẾU THU
    const phieuThu = await PhieuThu.create({
      hoKhauId,
      khoanThuId: selectedKhoanThuIds[0], // Lưu khoản thu đầu tiên
      soTien: tongTien,
      tongTien: tongTien,
      thang: thang || new Date().getMonth() + 1,
      nam: nam || new Date().getFullYear(),
      hanThanhToan: hanThanhToan || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      trangThai: 'chua_thanh_toan',
      ghiChu
    });

    console.log('✅ Created PhieuThu:', phieuThu.maPhieuThu);

    res.status(201).json({ 
      success: true, 
      message: '✅ Tạo phiếu thu thành công!',
      data: phieuThu 
    });
  } catch (error) {
    console.error('❌ Error creating PhieuThu:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ========== ĐÁNH DẤU ĐÃ THANH TOÁN ==========
router.put('/:id/paid', authenticate, async (req, res) => {
  try {
    const phieuThu = await PhieuThu.findByIdAndUpdate(
      req.params.id,
      { 
        trangThai: 'da_thanh_toan', // ← SỬ DỤNG ENUM CHUẨN
        ngayDong: new Date(),
        nguoiThuTien: req.user._id
      },
      { new: true }
    ).populate('nguoiThuTien', 'hoTen');
    
    if (!phieuThu) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phiếu thu' });
    }
    
    console.log('✅ Marked as paid:', phieuThu.maPhieuThu);
    
    res.json({ 
      success: true, 
      data: phieuThu, 
      message: '✅ Đã xác nhận thanh toán' 
    });
  } catch (error) {
    console.error('❌ Error marking paid:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// ========== XÓA PHIẾU THU ==========
router.delete('/:id', authenticate, authorize('admin', 'to_truong', 'ke_toan'), async (req, res) => {
  try {
    const phieuThu = await PhieuThu.findByIdAndDelete(req.params.id);
    
    if (!phieuThu) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phiếu thu' });
    }
    
    console.log('🗑️ Deleted PhieuThu:', phieuThu.maPhieuThu);
    
    res.json({ success: true, message: 'Đã xóa thành công' });
  } catch (error) {
    console.error('❌ Error deleting:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;