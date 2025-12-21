const express = require('express');
const router = express.Router();
const HoKhau = require('../models/HoKhau');
const NhanKhau = require('../models/NhanKhau');
const { authenticate, authorize } = require('../middleware/auth');

// ========== GET ALL HoKhau ==========
// ========== GET ALL HoKhau ==========
router.get('/', authenticate, async (req, res) => {
  try {
    let query = {};
    
    // ← DÂN CƯ/CHỦ HỘ CHỈ XEM HỘ KHẨU CỦA MÌNH
    if (req.user.vaiTro === 'dan_cu' || req.user.vaiTro === 'chu_ho') {
      const nhanKhauId = req.user.nhanKhauId?._id || req.user.nhanKhauId;
      
      if (!nhanKhauId) {
        return res.json({
          success: true,
          data: [],
          pagination: {
            total: 0,
            totalPages: 0,
            currentPage: 1
          }
        });
      }
      
      query = {
        $or: [
          { chuHo: nhanKhauId },
          { thanhVien: nhanKhauId }
        ]
      };
    }

    // ← ADMIN/TỔ TRƯỞNG XEM TẤT CẢ (KHÔNG LỌC GÌ)
    console.log('🔍 User role:', req.user.vaiTro);
    console.log('🔍 Query:', query);

    const hoKhaus = await HoKhau.find(query)
      .populate('chuHo', 'hoTen canCuocCongDan soDienThoai')
      .populate('thanhVien', 'hoTen canCuocCongDan ngaySinh gioiTinh quanHeVoiChuHo')
      .sort({ createdAt: -1 });

    console.log(`📊 Found ${hoKhaus.length} hộ khẩu`);

    res.json({
      success: true,
      data: hoKhaus,
      pagination: {
        total: hoKhaus.length,
        totalPages: 1,
        currentPage: 1
      }
    });
  } catch (error) {
    console.error('❌ Get all HoKhau error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ========== GET BY ID ==========
router.get('/:id', authenticate, async (req, res) => {
  try {
    const hoKhau = await HoKhau.findById(req.params.id)
      .populate('chuHo', 'hoTen canCuocCongDan soDienThoai')
      .populate('thanhVien', 'hoTen canCuocCongDan ngaySinh gioiTinh queQuan danToc ngheNghiep quanHeVoiChuHo');

    if (!hoKhau) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy hộ khẩu' 
      });
    }

    if (req.user.vaiTro === 'dan_cu' || req.user.vaiTro === 'chu_ho') {
      const nhanKhauId = req.user.nhanKhauId?._id || req.user.nhanKhauId;
      const isMember = hoKhau.thanhVien.some(tv => 
        tv._id.toString() === nhanKhauId.toString()
      );

      if (!isMember && hoKhau.chuHo._id.toString() !== nhanKhauId.toString()) {
        return res.status(403).json({ 
          success: false,
          message: 'Bạn không có quyền xem hộ khẩu này' 
        });
      }
    }

    res.json({
      success: true,
      data: hoKhau
    });
  } catch (error) {
    console.error('Get HoKhau by ID error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ========== CREATE ==========
router.post('/', authenticate, async (req, res) => {
  try {
    const { soHoKhau, diaChiThuongTru, ngayLap, chuHo } = req.body;

    console.log('📝 Creating HoKhau:');
    console.log('   User:', req.user.userName);
    console.log('   User role:', req.user.vaiTro);
    console.log('   Data:', { soHoKhau, diaChiThuongTru, chuHo });

    let trangThai = 'active';
    
    if (req.user.vaiTro === 'dan_cu') {
      trangThai = 'pending';
      console.log('🔔 Dân cư đăng ký → Trạng thái: pending');
    } else if (req.user.vaiTro === 'chu_ho') {
      trangThai = req.body.trangThai || 'pending';
    } else if (req.user.vaiTro === 'admin' || req.user.vaiTro === 'to_truong') {
      trangThai = req.body.trangThai || 'active';
    }

    const existingHoKhau = await HoKhau.findOne({ soHoKhau });
    if (existingHoKhau) {
      return res.status(400).json({
        success: false,
        message: `Số hộ khẩu ${soHoKhau} đã tồn tại`
      });
    }

    const chuHoId = chuHo || req.user.nhanKhauId?._id || req.user.nhanKhauId;
    
    if (!chuHoId) {
      return res.status(400).json({
        success: false,
        message: 'Không xác định được chủ hộ'
      });
    }

    console.log('👤 chuHoId:', chuHoId);

    // ← TẠO HỘ KHẨU (thanhVien CHỈ CÓ chuHo)
    const hoKhau = new HoKhau({
      soHoKhau,
      diaChiThuongTru,
      ngayLap: ngayLap || new Date(),
      chuHo: chuHoId,
      thanhVien: [chuHoId], // ← ARRAY OF ObjectId ĐƠN GIẢN
      trangThai,
      nguoiTao: req.user._id
    });

    await hoKhau.save();

    // ← CẬP NHẬT NhanKhau
    await NhanKhau.findByIdAndUpdate(
      chuHoId,
      { 
        hoKhauId: hoKhau._id,
        quanHeVoiChuHo: 'Chủ hộ'
      }
    );
    console.log('✅ Updated hoKhauId for chuHo:', chuHoId);

    // ← TẠO THÔNG BÁO (NẾU LÀ DÂN CƯ)
    if (req.user.vaiTro === 'dan_cu') {
      try {
        const { createNotificationForRoles } = require('../utils/notificationHelper');
        await createNotificationForRoles(
          ['admin', 'to_truong'],
          {
            type: 'ho_khau_moi',
            title: '🏠 Đơn đăng ký hộ khẩu mới',
            message: `${req.user.hoTen} vừa đăng ký hộ khẩu ${soHoKhau}. Vui lòng duyệt.`,
            link: `/dashboard/hokhau/${hoKhau._id}`,
            relatedId: hoKhau._id
          }
        );
        console.log('✅ Created notification for to_truong/admin');
      } catch (notifError) {
        console.error('⚠️ Notification error (non-critical):', notifError.message);
      }
    }

    console.log('✅ HoKhau created:', hoKhau._id);

    res.status(201).json({
      success: true,
      message: req.user.vaiTro === 'dan_cu' 
        ? '✅ Đăng ký hộ khẩu thành công! Vui lòng chờ tổ trưởng duyệt.' 
        : '✅ Tạo hộ khẩu thành công!',
      data: hoKhau
    });
  } catch (error) {
    console.error('❌ Create HoKhau error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ========== UPDATE ==========
router.put('/:id', authenticate, authorize('admin', 'to_truong', 'chu_ho'), async (req, res) => {
  try {
    const hoKhau = await HoKhau.findById(req.params.id);
    
    if (!hoKhau) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy hộ khẩu' 
      });
    }

    if (req.user.vaiTro === 'chu_ho') {
      const nhanKhauId = req.user.nhanKhauId?._id || req.user.nhanKhauId;
      if (hoKhau.chuHo.toString() !== nhanKhauId.toString()) {
        return res.status(403).json({ 
          success: false,
          message: 'Bạn chỉ có thể sửa hộ khẩu của mình' 
        });
      }
    }

    const updated = await HoKhau.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Update HoKhau error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ========== APPROVE ==========
router.patch('/:id/approve', authenticate, authorize('admin', 'to_truong'), async (req, res) => {
  try {
    const hoKhau = await HoKhau.findById(req.params.id);

    if (!hoKhau) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hộ khẩu'
      });
    }

    if (hoKhau.trangThai !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Hộ khẩu này đã được xử lý'
      });
    }

    hoKhau.trangThai = 'active';
    await hoKhau.save();

    res.json({
      success: true,
      message: '✅ Đã duyệt hộ khẩu thành công!',
      data: hoKhau
    });
  } catch (error) {
    console.error('Approve HoKhau error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ========== DELETE ==========
router.delete('/:id', authenticate, authorize('admin', 'to_truong'), async (req, res) => {
  try {
    const hoKhau = await HoKhau.findByIdAndDelete(req.params.id);

    if (!hoKhau) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy hộ khẩu' 
      });
    }

    await NhanKhau.updateMany(
      { hoKhauId: req.params.id },
      { $unset: { hoKhauId: "", quanHeVoiChuHo: "" } }
    );

    res.json({ 
      success: true,
      message: 'Xóa thành công' 
    });
  } catch (error) {
    console.error('Delete HoKhau error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ========== ADD MEMBER ==========
router.post('/:id/members', authenticate, authorize('admin', 'to_truong'), async (req, res) => {
  try {
    const { nhanKhauId, quanHeVoiChuHo } = req.body;

    const hoKhau = await HoKhau.findById(req.params.id);
    if (!hoKhau) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy hộ khẩu' 
      });
    }

    const nhanKhau = await NhanKhau.findById(nhanKhauId);
    if (!nhanKhau) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy nhân khẩu' 
      });
    }

    if (hoKhau.thanhVien.includes(nhanKhauId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Nhân khẩu đã có trong hộ khẩu' 
      });
    }

    hoKhau.thanhVien.push(nhanKhauId);
    await hoKhau.save();

    nhanKhau.hoKhauId = hoKhau._id;
    nhanKhau.quanHeVoiChuHo = quanHeVoiChuHo;
    await nhanKhau.save();

    res.json({
      success: true,
      data: hoKhau
    });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ========== REMOVE MEMBER ==========
router.delete('/:id/members/:memberId', authenticate, authorize('admin', 'to_truong'), async (req, res) => {
  try {
    const hoKhau = await HoKhau.findById(req.params.id);
    if (!hoKhau) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy hộ khẩu' 
      });
    }

    hoKhau.thanhVien = hoKhau.thanhVien.filter(
      tvId => tvId.toString() !== req.params.memberId
    );
    await hoKhau.save();

    await NhanKhau.findByIdAndUpdate(req.params.memberId, {
      $unset: { hoKhauId: "", quanHeVoiChuHo: "" }
    });

    res.json({ 
      success: true,
      message: 'Xóa thành viên thành công' 
    });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

module.exports = router;