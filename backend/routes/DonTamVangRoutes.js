const express = require('express');
const router = express.Router();
const DonTamVang = require('../models/DonTamVang');
const TamVang = require('../models/TamVang');
const { authenticate, authorize } = require('../middleware/auth');
const { createNotification } = require('../utils/notificationHelper');

// ========== 1. TẠO ĐƠN ==========
router.post('/', authenticate, async (req, res) => {
  try {
    const { nhanKhauId, noiDen, tuNgay, denNgay, lyDo, ghiChu } = req.body;

    if (!nhanKhauId || !noiDen || !tuNgay || !denNgay || !lyDo) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc'
      });
    }

    if (new Date(denNgay) <= new Date(tuNgay)) {
      return res.status(400).json({
        success: false,
        message: 'Ngày về phải sau ngày đi'
      });
    }

    const don = new DonTamVang({
      nhanKhauId,
      noiDen,
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
        '📤 Đơn tạm vắng mới',
        `Có đơn tạm vắng mới từ ${req.user.hoTen} cần duyệt`,
        `/dashboard/don-tam-vang/${don._id}`
      );
    }

    const populatedDon = await DonTamVang.findById(don._id)
      .populate('nhanKhauId', 'hoTen canCuocCongDan soDienThoai')
      .populate('nguoiTao', 'hoTen');

    res.status(201).json({
      success: true,
      message: '✅ Đã gửi đơn tạm vắng thành công! Vui lòng chờ tổ trưởng duyệt.',
      data: populatedDon
    });
  } catch (error) {
    console.error('Create DonTamVang error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ========== 2. LẤY DANH SÁCH ==========
router.get('/', authenticate, async (req, res) => {
  try {
    const { trangThai } = req.query;
    
    let filter = {};
    
    if (req.user.vaiTro === 'dan_cu' || req.user.vaiTro === 'chu_ho') {
      filter.nguoiTao = req.user._id;
    }
    
    if (trangThai) {
      filter.trangThai = trangThai;
    }

    const dons = await DonTamVang.find(filter)
      .populate('nhanKhauId', 'hoTen canCuocCongDan soDienThoai ngaySinh gioiTinh')
      .populate('nguoiTao', 'hoTen')
      .populate('nguoiXuLy', 'hoTen')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: dons
    });
  } catch (error) {
    console.error('Get DonTamVang error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ========== 3. CHI TIẾT ==========
router.get('/:id', authenticate, async (req, res) => {
  try {
    const don = await DonTamVang.findById(req.params.id)
      .populate('nhanKhauId', 'hoTen canCuocCongDan soDienThoai ngaySinh gioiTinh')
      .populate('nguoiTao', 'hoTen')
      .populate('nguoiXuLy', 'hoTen');

    if (!don) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn'
      });
    }

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
    console.error('Get DonTamVang detail error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ========== 4. DUYỆT ĐƠN ==========
router.post('/:id/approve', authenticate, authorize('admin', 'to_truong'), async (req, res) => {
  try {
    const don = await DonTamVang.findById(req.params.id)
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

    const tamVang = new TamVang({
      nhanKhauId: don.nhanKhauId._id,
      noiDen: don.noiDen,
      tuNgay: don.tuNgay,
      denNgay: don.denNgay,
      lyDo: don.lyDo,
      ghiChu: don.ghiChu,
      trangThai: 'da_duyet',
      nguoiDuyet: req.user._id,
      ngayDuyet: new Date()
    });

    await tamVang.save();

    don.trangThai = 'da_xu_ly';
    don.nguoiXuLy = req.user._id;
    don.ngayXuLy = new Date();
    await don.save();

    await createNotification(
      don.nguoiTao._id,
      'success',
      '✅ Đơn tạm vắng đã được duyệt',
      `Đơn tạm vắng của bạn đã được ${req.user.hoTen} phê duyệt`,
      `/dashboard/don-tam-vang/${don._id}`
    );

    console.log(`✅ Approved DonTamVang ${don._id} → Created TamVang ${tamVang._id}`);

    res.json({
      success: true,
      message: '✅ Đã duyệt đơn tạm vắng thành công!',
      data: { don, tamVang }
    });
  } catch (error) {
    console.error('Approve DonTamVang error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ========== 5. TỪ CHỐI ==========
router.post('/:id/reject', authenticate, authorize('admin', 'to_truong'), async (req, res) => {
  try {
    const { lyDoTuChoi } = req.body;

    const don = await DonTamVang.findById(req.params.id)
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

    don.trangThai = 'da_xu_ly';
    don.nguoiXuLy = req.user._id;
    don.ngayXuLy = new Date();
    don.lyDoTuChoi = lyDoTuChoi || 'Không đủ điều kiện';
    await don.save();

    await createNotification(
      don.nguoiTao._id,
      'error',
      '❌ Đơn tạm vắng bị từ chối',
      `Đơn tạm vắng của bạn đã bị từ chối. Lý do: ${lyDoTuChoi || 'Không đủ điều kiện'}`,
      `/dashboard/don-tam-vang/${don._id}`
    );

    console.log(`❌ Rejected DonTamVang ${don._id}`);

    res.json({
      success: true,
      message: '❌ Đã từ chối đơn tạm vắng',
      data: don
    });
  } catch (error) {
    console.error('Reject DonTamVang error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ========== 6. XÓA ĐƠN ==========
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const don = await DonTamVang.findById(req.params.id);

    if (!don) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn'
      });
    }

    if (
      don.nguoiTao.toString() !== req.user._id.toString() &&
      req.user.vaiTro !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xóa đơn này'
      });
    }

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
    console.error('Delete DonTamVang error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;