const express = require('express');
const router = express.Router();
const DonXinVaoHo = require('../models/DonXinVaoHo');
const NhanKhau = require('../models/NhanKhau');
const HoKhau = require('../models/HoKhau');
const { authenticate, authorize } = require('../middleware/auth');

// GET ALL - Danh sách đơn (Tổ trưởng xem tất cả, Chủ hộ xem của mình)
router.get('/', authenticate, async (req, res) => {
  try {
    const { trangThai, page = 1, limit = 20 } = req.query;
    
    let query = {};
    
    // Chủ hộ chỉ xem đơn của mình
    if (req.user.vaiTro === 'chu_ho') {
      query.chuHoId = req.user.nhanKhauId;
    }
    
    // Filter theo trạng thái
    if (trangThai) {
      query.trangThai = trangThai;
    }

    const dons = await DonXinVaoHo.find(query)
      .populate('hoKhauId', 'soHoKhau diaChiThuongTru')
      .populate('chuHoId', 'hoTen canCuocCongDan soDienThoai')
      .populate('nguoiDuyet', 'hoTen userName')
      .populate('nhanKhauId', 'hoTen canCuocCongDan')
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

// GET BY ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const don = await DonXinVaoHo.findById(req.params.id)
      .populate('hoKhauId')
      .populate('chuHoId')
      .populate('nguoiDuyet', 'hoTen userName')
      .populate('nhanKhauId');

    if (!don) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy đơn' 
      });
    }

    // Kiểm tra quyền: Chủ hộ chỉ xem đơn của mình
    if (req.user.vaiTro === 'chu_ho' && 
        don.chuHoId._id.toString() !== req.user.nhanKhauId.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Bạn không có quyền xem đơn này' 
      });
    }

    res.json({
      success: true,
      data: don
    });
  } catch (error) {
    console.error('Get DonXinVaoHo by ID error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// CREATE - Chủ hộ tạo đơn
router.post('/', authenticate, authorize('chu_ho', 'admin', 'to_truong'), async (req, res) => {
  try {
    const { hoKhauId, thongTinNguoiXin, quanHeVoiChuHo, lyDo } = req.body;

    // Kiểm tra hộ khẩu tồn tại
    const hoKhau = await HoKhau.findById(hoKhauId);
    if (!hoKhau) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy hộ khẩu' 
      });
    }

    // Kiểm tra user có phải chủ hộ không
    if (req.user.vaiTro === 'chu_ho' && 
        hoKhau.chuHo.toString() !== req.user.nhanKhauId.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Bạn không phải chủ hộ của hộ khẩu này' 
      });
    }

    // Kiểm tra CCCD đã tồn tại trong hệ thống chưa
    let nhanKhau = await NhanKhau.findOne({ 
      canCuocCongDan: thongTinNguoiXin.canCuocCongDan 
    });

    // Kiểm tra người này đã trong hộ khẩu nào chưa
    if (nhanKhau && nhanKhau.hoKhauId) {
      return res.status(400).json({ 
        success: false,
        message: `Người này đã thuộc hộ khẩu ${nhanKhau.hoKhauId.soHoKhau || 'khác'}` 
      });
    }

    const don = new DonXinVaoHo({
      hoKhauId,
      chuHoId: req.user.nhanKhauId,
      thongTinNguoiXin,
      quanHeVoiChuHo,
      lyDo,
      nhanKhauId: nhanKhau?._id || null
    });

    await don.save();

    res.status(201).json({
      success: true,
      data: don,
      message: 'Đã gửi đơn xin vào hộ. Vui lòng chờ tổ trưởng duyệt.'
    });
  } catch (error) {
    console.error('Create DonXinVaoHo error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// PUT - Duyệt đơn (Chỉ Tổ trưởng/Admin)
router.put('/:id/duyet', authenticate, authorize('admin', 'to_truong'), async (req, res) => {
  try {
    const { trangThai, ghiChuDuyet } = req.body;

    if (!['da_duyet', 'tu_choi'].includes(trangThai)) {
      return res.status(400).json({ 
        success: false,
        message: 'Trạng thái không hợp lệ' 
      });
    }

    const don = await DonXinVaoHo.findById(req.params.id)
      .populate('hoKhauId')
      .populate('chuHoId');

    if (!don) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy đơn' 
      });
    }

    if (don.trangThai !== 'cho_duyet') {
      return res.status(400).json({ 
        success: false,
        message: 'Đơn này đã được xử lý' 
      });
    }

    don.trangThai = trangThai;
    don.nguoiDuyet = req.user._id;
    don.ngayDuyet = new Date();
    don.ghiChuDuyet = ghiChuDuyet;

    // Nếu duyệt: Tạo hoặc cập nhật NhanKhau và thêm vào HoKhau
    if (trangThai === 'da_duyet') {
      let nhanKhau = don.nhanKhauId 
        ? await NhanKhau.findById(don.nhanKhauId)
        : null;

      // Nếu chưa có NhanKhau, tạo mới
      if (!nhanKhau) {
        nhanKhau = new NhanKhau({
          ...don.thongTinNguoiXin,
          hoKhauId: don.hoKhauId._id,
          quanHeVoiChuHo: don.quanHeVoiChuHo,
          trangThai: 'active'
        });
        await nhanKhau.save();
        don.nhanKhauId = nhanKhau._id;
      } else {
        // Cập nhật thông tin
        nhanKhau.hoKhauId = don.hoKhauId._id;
        nhanKhau.quanHeVoiChuHo = don.quanHeVoiChuHo;
        await nhanKhau.save();
      }

      // Thêm vào danh sách thành viên hộ khẩu
      const hoKhau = await HoKhau.findById(don.hoKhauId._id);
      const daTonTai = hoKhau.thanhVien.some(tv => 
        tv.nhanKhauId.toString() === nhanKhau._id.toString()
      );

      if (!daTonTai) {
        hoKhau.thanhVien.push({
          nhanKhauId: nhanKhau._id,
          quanHeVoiChuHo: don.quanHeVoiChuHo
        });
        await hoKhau.save();
      }
    }

    await don.save();

    res.json({
      success: true,
      data: don,
      message: trangThai === 'da_duyet' 
        ? 'Đã duyệt đơn và thêm vào hộ khẩu' 
        : 'Đã từ chối đơn'
    });
  } catch (error) {
    console.error('Approve DonXinVaoHo error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// DELETE - Xóa đơn (Chỉ chủ hộ xóa đơn của mình và đơn chưa duyệt)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const don = await DonXinVaoHo.findById(req.params.id);

    if (!don) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy đơn' 
      });
    }

    // Chỉ cho phép xóa đơn chưa duyệt
    if (don.trangThai !== 'cho_duyet') {
      return res.status(400).json({ 
        success: false,
        message: 'Chỉ có thể xóa đơn chưa duyệt' 
      });
    }

    // Chủ hộ chỉ xóa đơn của mình
    if (req.user.vaiTro === 'chu_ho' && 
        don.chuHoId.toString() !== req.user.nhanKhauId.toString()) {
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