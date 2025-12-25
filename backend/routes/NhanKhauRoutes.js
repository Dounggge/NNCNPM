const express = require('express');
const router = express.Router();
const NhanKhau = require('../models/NhanKhau');
const { authenticate, authorize, checkPermission, authorizeOwnerOrAdmin } = require('../middleware/auth');

// ========== GET AVAILABLE FOR HO KHAU (ĐỨNG TRƯỚC ROUTE /:id) ==========
router.get('/available-for-hokhau/:hoKhauId', authenticate, async (req, res) => {
  try {
    const { hoKhauId } = req.params;
    const { search } = req.query;

    console.log('🔍 [GET /available-for-hokhau/:hoKhauId] Params:', { hoKhauId, search });

    // ← TÌM NHÂN KHẨU:
    // 1. CHƯA CÓ hoKhauId (chưa thuộc hộ nào)
    // 2. HOẶC có hoKhauId NHƯNG KHÔNG PHẢI hộ hiện tại
    let query = {
      $or: [
        { hoKhauId: null },                          // ← Chưa có hộ khẩu
        { hoKhauId: { $exists: false } },           // ← Field không tồn tại
        { hoKhauId: { $ne: hoKhauId } }             // ← Thuộc hộ khác (nếu muốn cho phép chuyển hộ)
      ]
    };

    // ← NẾU CHỈ MUỐN LẤY NGƯỜI CHƯA CÓ HỘ KHẨU, DÙNG:
    // query = {
    //   $or: [
    //     { hoKhauId: null },
    //     { hoKhauId: { $exists: false } }
    //   ]
    // };

    if (search) {
      query.$and = [
        query,
        {
          $or: [
            { hoTen: { $regex: search, $options: 'i' } },
            { canCuocCongDan: { $regex: search, $options: 'i' } }
          ]
        }
      ];
    }

    const nhanKhaus = await NhanKhau.find(query)
      .select('hoTen canCuocCongDan ngaySinh gioiTinh queQuan hoKhauId')
      .populate('hoKhauId', 'soHoKhau')
      .limit(100)
      .sort({ hoTen: 1 });

    console.log(`✅ [GET /available-for-hokhau] Found ${nhanKhaus.length} nhân khẩu`);

    res.json({
      success: true,
      data: nhanKhaus
    });
  } catch (error) {
    console.error('❌ Get available nhan khau error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ========== GET ALL NhanKhau ==========
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    let query = {};
    
    // ← DÂN CƯ CHỈ XEM THÔNG TIN CỦA MÌNH
    if (req.user.vaiTro === 'dan_cu') {
      const nhanKhauId = req.user.nhanKhauId?._id || req.user.nhanKhauId;
      if (nhanKhauId) {
        query._id = nhanKhauId;
      } else {
        return res.json({
          success: true,
          data: [],
          pagination: {
            total: 0,
            totalPages: 0,
            currentPage: 1,
            limit: parseInt(limit)
          }
        });
      }
    }

    if (search && (req.user.vaiTro === 'admin' || req.user.vaiTro === 'to_truong')) {
      query.$or = [
        { hoTen: { $regex: search, $options: 'i' } },
        { canCuocCongDan: { $regex: search, $options: 'i' } }
      ];
    }

    const nhanKhaus = await NhanKhau.find(query)
      .populate('hoKhauId', 'soHoKhau diaChiThuongTru')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await NhanKhau.countDocuments(query);

    res.json({
      success: true,
      data: nhanKhaus,
      pagination: {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get all NhanKhau error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ========== GET BY ID ==========
router.get('/:id', authenticate, async (req, res) => {
  try {
    const nhanKhau = await NhanKhau.findById(req.params.id)
      .populate('hoKhauId', 'soHoKhau')
      .populate('userId', 'userName vaiTro');

    if (!nhanKhau) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy nhân khẩu' 
      });
    }

    const userNhanKhauId = req.user.nhanKhauId?._id?.toString() || req.user.nhanKhauId?.toString();
    const nhanKhauIdStr = nhanKhau._id.toString();

    if (req.user.vaiTro === 'dan_cu' && userNhanKhauId !== nhanKhauIdStr) {
      return res.status(403).json({ 
        success: false,
        message: 'Bạn không có quyền xem thông tin này' 
      });
    }

    res.json({
      success: true,
      data: nhanKhau
    });
  } catch (error) {
    console.error('Get NhanKhau by ID error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ========== CREATE ==========
// ← GIỮ NGUYÊN: CHO PHÉP TẤT CẢ USER TẠO
router.post('/', authenticate, async (req, res) => {
  try {
    console.log('📝 Creating NhanKhau:');
    console.log('   User:', req.user.userName);
    console.log('   Data:', req.body);

    const nhanKhau = new NhanKhau({
      ...req.body,
      userId: req.user._id
    });

    await nhanKhau.save();

    console.log('✅ NhanKhau created:', nhanKhau._id);

    res.status(201).json({
      success: true,
      data: nhanKhau,
      message: 'Tạo nhân khẩu thành công'
    });
  } catch (error) {
    console.error('❌ Create NhanKhau error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'CCCD đã tồn tại trong hệ thống' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ========== UPDATE ==========
// ← SỬA: CHO PHÉP USER CẬP NHẬT THÔNG TIN CỦA MÌNH
router.put('/:id', authenticate, async (req, res) => {
  try {
    const nhanKhau = await NhanKhau.findById(req.params.id);

    if (!nhanKhau) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy nhân khẩu' 
      });
    }

    // ← KIỂM TRA QUYỀN: DÂN CƯ CHỈ SỬA THÔNG TIN CỦA MÌNH
    if (req.user.vaiTro === 'dan_cu') {
      const userNhanKhauId = req.user.nhanKhauId?._id || req.user.nhanKhauId;
      if (nhanKhau._id.toString() !== userNhanKhauId?.toString()) {
        return res.status(403).json({ 
          success: false,
          message: 'Bạn chỉ có thể sửa thông tin của mình' 
        });
      }
    }

    const updated = await NhanKhau.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updated,
      message: 'Cập nhật thông tin thành công'
    });
  } catch (error) {
    console.error('Update NhanKhau error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ========== DELETE ==========
// ← GIỮ NGUYÊN: CHỈ ADMIN/TỔ TRƯỞNG MỚI XÓA ĐƯỢC
router.delete('/:id', authenticate, authorize('admin', 'to_truong'), async (req, res) => {
  try {
    const nhanKhau = await NhanKhau.findByIdAndDelete(req.params.id);

    if (!nhanKhau) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy nhân khẩu' 
      });
    }

    // Xóa userId reference
    if (nhanKhau.userId) {
      const User = require('../models/User');
      await User.findByIdAndUpdate(nhanKhau.userId, { 
        $unset: { nhanKhauId: "" } 
      });
    }

    res.json({ 
      success: true,
      message: 'Xóa thành công' 
    });
  } catch (error) {
    console.error('Delete NhanKhau error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

module.exports = router;