const express = require('express');
const router = express.Router();
const DonTamTru = require('../models/DonTamTru');
const TamTru = require('../models/TamTru');
const { authenticate, authorize } = require('../middleware/auth');
const { createNotification } = require('../utils/notificationHelper');

// ========== 1. TẠO ĐƠN (DÂN CƯ) ==========
router.post('/', authenticate, async (req, res) => {
  try {
    const { nhanKhauId, diaChiTamTru, tuNgay, denNgay, lyDo, ghiChu } = req.body;

    // Validate
    if (!nhanKhauId || !diaChiTamTru || !tuNgay || !denNgay || !lyDo) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc'
      });
    }

    // Kiểm tra ngày
    if (new Date(denNgay) <= new Date(tuNgay)) {
      return res.status(400).json({
        success: false,
        message: 'Ngày kết thúc phải sau ngày bắt đầu'
      });
    }

    // Tạo đơn
    const don = new DonTamTru({
      nhanKhauId,
      diaChiTamTru,
      tuNgay,
      denNgay,
      lyDo,
      ghiChu,
      nguoiTao: req.user._id,
      trangThai: 'cho_xu_ly'
    });

    await don.save();

    // Gửi thông báo cho tổ trưởng
    const User = require('../models/User');
    const toTruongs = await User.find({ vaiTro: 'to_truong', trangThai: 'active' });
    
    for (const tt of toTruongs) {
      await createNotification(
        tt._id,
        'warning',
        '📥 Đơn tạm trú mới',
        `Có đơn tạm trú mới từ ${req.user.hoTen} cần duyệt`,
        `/dashboard/don-tam-tru/${don._id}`
      );
    }

    const populatedDon = await DonTamTru.findById(don._id)
      .populate('nhanKhauId', 'hoTen canCuocCongDan soDienThoai')
      .populate('nguoiTao', 'hoTen');

    res.status(201).json({
      success: true,
      message: '✅ Đã gửi đơn tạm trú thành công! Vui lòng chờ tổ trưởng duyệt.',
      data: populatedDon
    });
  } catch (error) {
    console.error('Create DonTamTru error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ========== 2. LẤY DANH SÁCH ĐƠN ==========
router.get('/', authenticate, async (req, res) => {
  try {
    const { trangThai } = req.query;
    
    let filter = {};
    
    // Nếu là dân cư → chỉ thấy đơn của mình
    if (req.user.vaiTro === 'dan_cu' || req.user.vaiTro === 'chu_ho') {
      filter.nguoiTao = req.user._id;
    }
    
    // Lọc theo trạng thái (nếu có)
    if (trangThai) {
      filter.trangThai = trangThai;
    }

    const dons = await DonTamTru.find(filter)
      .populate('nhanKhauId', 'hoTen canCuocCongDan soDienThoai ngaySinh gioiTinh')
      .populate('nguoiTao', 'hoTen')
      .populate('nguoiXuLy', 'hoTen')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: dons
    });
  } catch (error) {
    console.error('Get DonTamTru error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ========== 3. CHI TIẾT ĐƠN ==========
router.get('/:id', authenticate, async (req, res) => {
  try {
    const don = await DonTamTru.findById(req.params.id)
      .populate('nhanKhauId', 'hoTen canCuocCongDan soDienThoai ngaySinh gioiTinh')
      .populate('nguoiTao', 'hoTen')
      .populate('nguoiXuLy', 'hoTen');

    if (!don) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn'
      });
    }

    // Kiểm tra quyền: chỉ người tạo hoặc tổ trưởng/admin mới xem được
    if (
      don.nguoiTao.toString() !== req.user._id.toString() &&
      !['admin', 'to_truong'].includes(req.user.vaiTro)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xem đơn này'
      });
    }

    res.json({
      success: true,
      data: don
    });
  } catch (error) {
    console.error('Get DonTamTru detail error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ========== 4. DUYỆT ĐƠN (TỔ TRƯỞNG/ADMIN) ==========
router.post('/:id/approve', authenticate, authorize('admin', 'to_truong'), async (req, res) => {
  try {
    const don = await DonTamTru.findById(req.params.id)
      .populate('nhanKhauId')
      .populate('nguoiTao');

    if (!don) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn'
      });
    }

    if (don.trangThai === 'da_xu_ly') {
      return res.status(400).json({
        success: false,
        message: 'Đơn này đã được xử lý trước đó'
      });
    }

    // Tạo bản ghi TamTru chính thức
    const tamTru = new TamTru({
      nhanKhauId: don.nhanKhauId._id,
      diaChiTamTru: don.diaChiTamTru,
      tuNgay: don.tuNgay,
      denNgay: don.denNgay,
      lyDo: don.lyDo,
      ghiChu: don.ghiChu,
      trangThai: 'da_duyet',
      nguoiDuyet: req.user._id,
      ngayDuyet: new Date()
    });

    await tamTru.save();

    // Cập nhật trạng thái đơn
    don.trangThai = 'da_xu_ly';
    don.nguoiXuLy = req.user._id;
    don.ngayXuLy = new Date();
    await don.save();

    // Gửi thông báo cho người gửi đơn
    await createNotification(
      don.nguoiTao._id,
      'success',
      '✅ Đơn tạm trú đã được duyệt',
      `Đơn tạm trú của bạn đã được ${req.user.hoTen} phê duyệt`,
      `/dashboard/don-tam-tru/${don._id}`
    );

    console.log(`✅ Approved DonTamTru ${don._id} → Created TamTru ${tamTru._id}`);

    res.json({
      success: true,
      message: '✅ Đã duyệt đơn tạm trú thành công!',
      data: {
        don,
        tamTru
      }
    });
  } catch (error) {
    console.error('Approve DonTamTru error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ========== 5. TỪ CHỐI ĐƠN (TỔ TRƯỞNG/ADMIN) ==========
router.post('/:id/reject', authenticate, authorize('admin', 'to_truong'), async (req, res) => {
  try {
    const { lyDoTuChoi } = req.body;

    const don = await DonTamTru.findById(req.params.id)
      .populate('nguoiTao');

    if (!don) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn'
      });
    }

    if (don.trangThai === 'da_xu_ly') {
      return res.status(400).json({
        success: false,
        message: 'Đơn này đã được xử lý trước đó'
      });
    }

    // Cập nhật trạng thái
    don.trangThai = 'da_xu_ly';
    don.nguoiXuLy = req.user._id;
    don.ngayXuLy = new Date();
    don.lyDoTuChoi = lyDoTuChoi || 'Không đủ điều kiện';
    await don.save();

    // Gửi thông báo cho người gửi đơn
    await createNotification(
      don.nguoiTao._id,
      'error',
      '❌ Đơn tạm trú bị từ chối',
      `Đơn tạm trú của bạn đã bị từ chối. Lý do: ${lyDoTuChoi || 'Không đủ điều kiện'}`,
      `/dashboard/don-tam-tru/${don._id}`
    );

    console.log(`❌ Rejected DonTamTru ${don._id}`);

    res.json({
      success: true,
      message: '❌ Đã từ chối đơn tạm trú',
      data: don
    });
  } catch (error) {
    console.error('Reject DonTamTru error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ========== 6. XÓA ĐƠN (NGƯỜI TẠO hoặc ADMIN) ==========
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const don = await DonTamTru.findById(req.params.id);

    if (!don) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn'
      });
    }

    // Chỉ người tạo hoặc admin mới xóa được
    if (
      don.nguoiTao.toString() !== req.user._id.toString() &&
      req.user.vaiTro !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xóa đơn này'
      });
    }

    // Không cho xóa đơn đã duyệt
    if (don.trangThai === 'da_xu_ly') {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa đơn đã được xử lý'
      });
    }

    await don.deleteOne();

    res.json({
      success: true,
      message: '✅ Đã xóa đơn'
    });
  } catch (error) {
    console.error('Delete DonTamTru error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;