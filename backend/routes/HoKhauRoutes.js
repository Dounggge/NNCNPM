const express = require('express');
const router = express.Router();
const HoKhau = require('../models/HoKhau');
const NhanKhau = require('../models/NhanKhau');
const { authenticate, authorize } = require('../middleware/auth');

// ========== GET ALL HoKhau ==========
router.get('/', authenticate, async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    
    let query = {};
    
    // ← DÂN CƯ CHỈ XEM HỘ KHẨU CỦA MÌNH
    if (req.user.vaiTro === 'dan_cu' || req.user.vaiTro === 'chu_ho') {
      // Tìm hộ khẩu có chứa nhanKhauId của user
      if (req.user.nhanKhauId) {
        query = {
          thanhVien: {
            $elemMatch: {
              nhanKhauId: req.user.nhanKhauId
            }
          }
        };
      } else {
        // Nếu chưa có nhanKhauId → trả về rỗng
        return res.json({
          hoKhaus: [],
          totalPages: 0,
          currentPage: 1,
          total: 0
        });
      }
    }
    
    // Search (chỉ với admin/tổ trưởng)
    if (search && (req.user.vaiTro === 'admin' || req.user.vaiTro === 'to_truong')) {
      query = {
        ...query,
        $or: [
          { soHoKhau: { $regex: search, $options: 'i' } },
          { diaChiThuongTru: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const hoKhaus = await HoKhau.find(query)
      .populate('chuHo', 'hoTen canCuocCongDan')
      .populate('thanhVien.nhanKhauId', 'hoTen canCuocCongDan ngaySinh gioiTinh')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await HoKhau.countDocuments(query);

    res.json({
      hoKhaus,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get HoKhau error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ========== GET BY ID ==========
router.get('/:id', authenticate, async (req, res) => {
  try {
    const hoKhau = await HoKhau.findById(req.params.id)
      .populate('chuHo', 'hoTen canCuocCongDan soDienThoai')
      .populate('thanhVien.nhanKhauId', 'hoTen canCuocCongDan ngaySinh gioiTinh queQuan danToc ngheNghiep');

    if (!hoKhau) {
      return res.status(404).json({ message: 'Không tìm thấy hộ khẩu' });
    }

    // ← KIỂM TRA QUYỀN: DÂN CƯ CHỈ XEM HỘ KHẨU CỦA MÌNH
    if (req.user.vaiTro === 'dan_cu' || req.user.vaiTro === 'chu_ho') {
      const isMember = hoKhau.thanhVien.some(tv => 
        tv.nhanKhauId && 
        req.user.nhanKhauId &&
        tv.nhanKhauId._id.toString() === req.user.nhanKhauId.toString()
      );

      if (!isMember) {
        return res.status(403).json({ 
          message: 'Bạn không có quyền xem hộ khẩu này' 
        });
      }
    }

    res.json(hoKhau);
  } catch (error) {
    console.error('Get HoKhau by ID error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ========== CREATE ==========
router.post('/', authenticate, authorize('admin', 'to_truong', 'chu_ho', 'dan_cu'), async (req, res) => {
  try {
    const userRole = req.user.vaiTro;
    
    // ← NẾU LÀ DÂN CƯ → TỰ ĐỘNG SET `trangThai: 'pending'`
    let finalTrangThai = req.body.trangThai;
    if (userRole === 'dan_cu') {
      finalTrangThai = 'pending'; // ← CHỜ DUYỆT
      console.log('🔔 Dân cư đăng ký hộ khẩu mới → Trạng thái: pending');
    } else if (userRole === 'chu_ho') {
      finalTrangThai = req.body.trangThai || 'pending';
    } else {
      finalTrangThai = req.body.trangThai || 'active'; // ← ADMIN/TỔ TRƯỞNG → ACTIVE NGAY
    }

    const hoKhau = new HoKhau({
      ...req.body,
      trangThai: finalTrangThai,
      nguoiTao: req.user._id
    });
    
    await hoKhau.save();

    // Cập nhật hoKhauId cho các thành viên
    if (req.body.thanhVien && req.body.thanhVien.length > 0) {
      const nhanKhauIds = req.body.thanhVien.map(tv => tv.nhanKhauId);
      await NhanKhau.updateMany(
        { _id: { $in: nhanKhauIds } },
        { hoKhauId: hoKhau._id }
      );
    }

    res.status(201).json({
      success: true,
      message: userRole === 'dan_cu' 
        ? '✅ Đăng ký hộ khẩu thành công! Vui lòng chờ tổ trưởng duyệt.' 
        : '✅ Tạo hộ khẩu thành công!',
      data: hoKhau
    });
  } catch (error) {
    console.error('Create HoKhau error:', error);
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
      return res.status(404).json({ message: 'Không tìm thấy hộ khẩu' });
    }

    // CHỦ HỘ CHỈ SỬA HỘ KHẨU CỦA MÌNH
    if (req.user.vaiTro === 'chu_ho') {
      if (hoKhau.chuHo.toString() !== req.user.nhanKhauId.toString()) {
        return res.status(403).json({ 
          message: 'Bạn chỉ có thể sửa hộ khẩu của mình' 
        });
      }
    }

    const updated = await HoKhau.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updated);
  } catch (error) {
    console.error('Update HoKhau error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ========== DELETE ==========
router.delete('/:id', authenticate, authorize('admin', 'to_truong'), async (req, res) => {
  try {
    const hoKhau = await HoKhau.findByIdAndDelete(req.params.id);

    if (!hoKhau) {
      return res.status(404).json({ message: 'Không tìm thấy hộ khẩu' });
    }

    // Xóa hoKhauId khỏi các nhân khẩu
    await NhanKhau.updateMany(
      { hoKhauId: req.params.id },
      { $unset: { hoKhauId: "" } }
    );

    res.json({ message: 'Xóa thành công' });
  } catch (error) {
    console.error('Delete HoKhau error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ========== ADD MEMBER ==========
router.post('/:id/members', authenticate, authorize('admin', 'to_truong'), async (req, res) => {
  try {
    const { nhanKhauId, quanHeVoiChuHo } = req.body;

    const hoKhau = await HoKhau.findById(req.params.id);
    if (!hoKhau) {
      return res.status(404).json({ message: 'Không tìm thấy hộ khẩu' });
    }

    const nhanKhau = await NhanKhau.findById(nhanKhauId);
    if (!nhanKhau) {
      return res.status(404).json({ message: 'Không tìm thấy nhân khẩu' });
    }

    // Check duplicate
    const exists = hoKhau.thanhVien.some(tv => 
      tv.nhanKhauId.toString() === nhanKhauId
    );
    if (exists) {
      return res.status(400).json({ message: 'Nhân khẩu đã có trong hộ khẩu' });
    }

    hoKhau.thanhVien.push({ nhanKhauId, quanHeVoiChuHo });
    await hoKhau.save();

    nhanKhau.hoKhauId = hoKhau._id;
    nhanKhau.quanHeVoiChuHo = quanHeVoiChuHo;
    await nhanKhau.save();

    res.json(hoKhau);
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ========== REMOVE MEMBER ==========
router.delete('/:id/members/:memberId', authenticate, authorize('admin', 'to_truong'), async (req, res) => {
  try {
    const hoKhau = await HoKhau.findById(req.params.id);
    if (!hoKhau) {
      return res.status(404).json({ message: 'Không tìm thấy hộ khẩu' });
    }

    hoKhau.thanhVien = hoKhau.thanhVien.filter(
      tv => tv.nhanKhauId.toString() !== req.params.memberId
    );
    await hoKhau.save();

    await NhanKhau.findByIdAndUpdate(req.params.memberId, {
      $unset: { hoKhauId: "", quanHeVoiChuHo: "" }
    });

    res.json({ message: 'Xóa thành viên thành công' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;