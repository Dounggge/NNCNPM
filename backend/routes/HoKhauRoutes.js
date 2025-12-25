const express = require('express');
const router = express.Router();
const HoKhau = require('../models/HoKhau');
const NhanKhau = require('../models/NhanKhau');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');
const { createNotification } = require('../utils/notificationHelper');

// ========== 1. GET AVAILABLE (ĐỨNG ĐẦU TIÊN) ==========
router.get('/available-for-join', authenticate, async (req, res) => {
  try {
    const { search, limit = 100 } = req.query;

    let query = {
      trangThai: { $in: ['active', 'pending'] }
    };

    if (search) {
      query.$or = [
        { soHoKhau: { $regex: search, $options: 'i' } },
        { diaChiThuongTru: { $regex: search, $options: 'i' } }
      ];
    }

    const hoKhaus = await HoKhau.find(query)
      .populate('chuHo', 'hoTen canCuocCongDan soDienThoai')
      .select('_id soHoKhau chuHo diaChiThuongTru trangThai')
      .sort({ soHoKhau: 1 })
      .limit(parseInt(limit));

    console.log(`📊 [available-for-join] Found ${hoKhaus.length} hộ khẩu`);

    res.json({
      success: true,
      data: hoKhaus
    });
  } catch (error) {
    console.error('❌ Get available error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ========== 2. GET ALL (ĐỨT THỨ 2) ==========
router.get('/', authenticate, async (req, res) => {
  try {
    const { trangThai, search, page = 1, limit = 100 } = req.query;

    console.log('🔍 [GET /] Query params:', { trangThai, search, page, limit });
    console.log('👤 [GET /] User:', {
      id: req.user._id,
      role: req.user.vaiTro,
      nhanKhauId: req.user.nhanKhauId
    });

    let query = {};
    
    // ← FILTER THEO VAI TRÒ
    if (req.user.vaiTro === 'dan_cu' || req.user.vaiTro === 'chu_ho') {
      // ← FIX: POPULATE USER TRƯỚC KHI LẤY nhanKhauId
      const userWithProfile = await User.findById(req.user._id).populate('nhanKhauId');
      const nhanKhauId = userWithProfile?.nhanKhauId?._id;
      
      console.log('🔍 [GET /] Resolved nhanKhauId:', nhanKhauId);

      if (!nhanKhauId) {
        console.log('⚠️ [GET /] User has no nhanKhauId → Return empty');
        return res.json({
          success: true,
          data: [],
          pagination: { total: 0, totalPages: 0, currentPage: 1, limit: parseInt(limit) }
        });
      }
      
      query = {
        $or: [
          { chuHo: nhanKhauId },
          { thanhVien: nhanKhauId }
        ]
      };
    }

    // ← FILTER TRẠNG THÁI
    if (trangThai) {
      const statusArray = trangThai.split(',');
      query.trangThai = { $in: statusArray };
    }

    // ← SEARCH
    if (search) {
      query.$or = [
        { soHoKhau: { $regex: search, $options: 'i' } },
        { diaChiThuongTru: { $regex: search, $options: 'i' } }
      ];
    }

    console.log('🔍 [GET /] Final query:', JSON.stringify(query, null, 2));

    const hoKhaus = await HoKhau.find(query)
      .populate('chuHo', 'hoTen canCuocCongDan soDienThoai')
      .populate('thanhVien', 'hoTen canCuocCongDan ngaySinh gioiTinh quanHeVoiChuHo')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await HoKhau.countDocuments(query);

    console.log(`✅ [GET /] Found ${hoKhaus.length}/${total} hộ khẩu (filter: ${trangThai || 'all'})`);

    res.json({
      success: true,
      data: hoKhaus,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('❌ [GET /] Error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ========== 3. GET BY ID (ĐỨT THỨ 3) ==========
router.get('/:id', authenticate, async (req, res) => {
  try {
    console.log('🔍 [GET /:id] Fetching hộ khẩu:', req.params.id);
    console.log('👤 [GET /:id] User:', {
      id: req.user._id,
      role: req.user.vaiTro,
      nhanKhauId: req.user.nhanKhauId
    });

    const hoKhau = await HoKhau.findById(req.params.id)
      .populate('chuHo', 'hoTen canCuocCongDan soDienThoai')
      .populate('thanhVien', 'hoTen canCuocCongDan ngaySinh gioiTinh quanHeVoiChuHo');

    if (!hoKhau) {
      console.log('❌ [GET /:id] Hộ khẩu not found');
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy hộ khẩu' 
      });
    }

    console.log('✅ [GET /:id] Hộ khẩu found:', {
      soHoKhau: hoKhau.soHoKhau,
      chuHo: hoKhau.chuHo?._id,
      thanhVienCount: hoKhau.thanhVien?.length
    });

    // ← KIỂM TRA QUYỀN (CHỈ DÂN CƯ/CHỦ HỘ)
    if (req.user.vaiTro === 'dan_cu' || req.user.vaiTro === 'chu_ho') {
      // ← FIX: POPULATE USER TRƯỚC
      const userWithProfile = await User.findById(req.user._id).populate('nhanKhauId');
      const nhanKhauId = userWithProfile?.nhanKhauId?._id;

      console.log('🔍 [GET /:id] Checking permission:', {
        userNhanKhauId: nhanKhauId?.toString(),
        chuHoId: hoKhau.chuHo?._id?.toString(),
        thanhVienIds: hoKhau.thanhVien?.map(tv => tv._id?.toString())
      });

      const isChuHo = hoKhau.chuHo?._id?.toString() === nhanKhauId?.toString();
      const isThanhVien = hoKhau.thanhVien?.some(tv => 
        tv._id?.toString() === nhanKhauId?.toString()
      );

      console.log('🔍 [GET /:id] Permission result:', { isChuHo, isThanhVien });

      if (!isChuHo && !isThanhVien) {
        console.log('❌ [GET /:id] Access denied - User not in hộ khẩu');
        return res.status(403).json({ 
          success: false,
          message: 'Bạn không có quyền xem hộ khẩu này' 
        });
      }
    }

    console.log('✅ [GET /:id] Access granted');

    res.json({
      success: true,
      data: hoKhau
    });
  } catch (error) {
    console.error('❌ [GET /:id] Error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ========== 4. CREATE ==========
router.post('/', authenticate, async (req, res) => {
  try {
    const { soHoKhau, chuHoId, diaChiThuongTru, ngayLap, trangThai } = req.body;

    console.log('📝 [POST /] Received data:', { 
      soHoKhau, 
      chuHoId, 
      diaChiThuongTru,
      user: req.user._id 
    });

    // ← VALIDATE DỮ LIỆU ĐẦU VÀO
    if (!soHoKhau || !chuHoId || !diaChiThuongTru) {
      return res.status(400).json({ 
        success: false,
        message: 'Thiếu thông tin bắt buộc: Số hộ khẩu, Chủ hộ, Địa chỉ' 
      });
    }

    // ← KIỂM TRA SỐ HỘ KHẨU ĐÃ TỒN TẠI
    const existingHoKhau = await HoKhau.findOne({ soHoKhau });
    if (existingHoKhau) {
      console.log('❌ [POST /] Số hộ khẩu đã tồn tại:', soHoKhau);
      return res.status(400).json({ 
        success: false,
        message: `Số hộ khẩu "${soHoKhau}" đã tồn tại. Vui lòng chọn số khác.` 
      });
    }

    // ← KIỂM TRA CHỦ HỘ TỒN TẠI
    console.log('🔍 [POST /] Finding chuHo with ID:', chuHoId);
    const chuHo = await NhanKhau.findById(chuHoId);
    
    if (!chuHo) {
      console.log('❌ [POST /] Chủ hộ not found with ID:', chuHoId);
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy thông tin chủ hộ. Vui lòng khai báo thông tin cá nhân trước hoặc chọn chủ hộ khác.' 
      });
    }

    console.log('✅ [POST /] Chủ hộ found:', {
      id: chuHo._id,
      hoTen: chuHo.hoTen,
      currentHoKhauId: chuHo.hoKhauId
    });

    // ← KIỂM TRA CHỦ HỘ ĐÃ CÓ HỘ KHẨU CHƯA (CHO PHÉP NẾU NULL)
    if (chuHo.hoKhauId) {
      const oldHoKhau = await HoKhau.findById(chuHo.hoKhauId);
      
      if (oldHoKhau) {
        console.log('❌ [POST /] Chủ hộ đã có hộ khẩu:', oldHoKhau.soHoKhau);
        return res.status(400).json({ 
          success: false,
          message: `${chuHo.hoTen} đã là ${chuHo.quanHeVoiChuHo || 'thành viên'} của hộ khẩu ${oldHoKhau.soHoKhau}. Vui lòng xóa khỏi hộ khẩu cũ trước.` 
        });
      } else {
        // ← HỘ KHẨU CŨ ĐÃ BỊ XÓA → XÓA REFERENCE
        console.log('⚠️ [POST /] Old hoKhauId invalid, cleaning up...');
        chuHo.hoKhauId = null;
        chuHo.quanHeVoiChuHo = null;
        await chuHo.save();
      }
    }

    // ← TẠO HỘ KHẨU MỚI
    console.log('📝 [POST /] Creating new hộ khẩu...');
    const hoKhau = new HoKhau({
      soHoKhau,
      chuHo: chuHoId,
      diaChiThuongTru,
      ngayLap: ngayLap || new Date(),
      trangThai: trangThai || 'pending', // ← MẶC ĐỊNH CHỜ DUYỆT
      nguoiTao: req.user._id,
      thanhVien: [chuHoId] // ← TỰ ĐỘNG THÊM CHỦ HỘ VÀO DANH SÁCH
    });

    await hoKhau.save();
    console.log('✅ [POST /] HoKhau created:', hoKhau._id);

    // ← CẬP NHẬT NHÂN KHẨU
    chuHo.hoKhauId = hoKhau._id;
    chuHo.quanHeVoiChuHo = 'Chủ hộ';
    await chuHo.save();
    console.log('✅ [POST /] Updated chuHo:', chuHo.hoTen);

    // ← GỬI THÔNG BÁO CHO ADMIN/TỔ TRƯỞNG
    try {
      const admins = await User.find({ 
        vaiTro: { $in: ['admin', 'to_truong'] },
        trangThai: 'active'
      });

      for (const admin of admins) {
        await createNotification(
          admin._id,
          'info',
          '🏠 Hộ khẩu mới đăng ký',
          `Hộ khẩu ${soHoKhau} (Chủ hộ: ${chuHo.hoTen}) đã đăng ký mới và chờ duyệt.`,
          `/dashboard/hokhau/${hoKhau._id}`
        );
      }
      console.log(`✅ [POST /] Sent notifications to ${admins.length} admins`);
    } catch (notifError) {
      console.error('⚠️ [POST /] Notification error (non-critical):', notifError.message);
    }

    // ← POPULATE ĐỂ TRẢ VỀ
    const populatedHoKhau = await HoKhau.findById(hoKhau._id)
      .populate('chuHo', 'hoTen canCuocCongDan ngaySinh gioiTinh')
      .populate('thanhVien', 'hoTen canCuocCongDan quanHeVoiChuHo');

    console.log('✅ [POST /] Successfully created hộ khẩu:', populatedHoKhau.soHoKhau);

    res.status(201).json({
      success: true,
      message: `✅ Đã tạo hộ khẩu ${soHoKhau} thành công! Vui lòng chờ tổ trưởng duyệt.`,
      data: populatedHoKhau
    });
  } catch (error) {
    console.error('❌ [POST /] Error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Lỗi server khi tạo hộ khẩu' 
    });
  }
});

// ========== 5. UPDATE ==========
router.put('/:id', authenticate, authorize('admin', 'to_truong', 'chu_ho'), async (req, res) => {
  try {
    console.log('✏️ [PUT /:id] Updating hộ khẩu:', req.params.id);

    const hoKhau = await HoKhau.findById(req.params.id);
    
    if (!hoKhau) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy hộ khẩu' 
      });
    }

    if (req.user.vaiTro === 'chu_ho') {
      const userWithProfile = await User.findById(req.user._id).populate('nhanKhauId');
      const nhanKhauId = userWithProfile?.nhanKhauId?._id;

      if (hoKhau.chuHo.toString() !== nhanKhauId?.toString()) {
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
    ).populate('chuHo').populate('thanhVien');

    console.log('✅ [PUT /:id] Updated successfully');

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('❌ [PUT /:id] Error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ========== 6. APPROVE ==========
router.patch('/:id/approve', authenticate, authorize('admin', 'to_truong'), async (req, res) => {
  try {
    console.log('✅ [PATCH /:id/approve] Approving hộ khẩu:', req.params.id);

    const hoKhau = await HoKhau.findById(req.params.id).populate('chuHo');

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
    hoKhau.nguoiDuyet = req.user._id;
    hoKhau.ngayDuyet = new Date();
    await hoKhau.save();

    // ← GỬI THÔNG BÁO
    if (hoKhau.nguoiTao) {
      await createNotification(
        hoKhau.nguoiTao,
        'success',
        'Hộ khẩu đã được duyệt',
        `Hộ khẩu ${hoKhau.soHoKhau} đã được phê duyệt`,
        `/dashboard/hokhau/${hoKhau._id}`
      );
    }

    const chuHoUser = await User.findOne({ nhanKhauId: hoKhau.chuHo._id });
    if (chuHoUser && chuHoUser._id.toString() !== hoKhau.nguoiTao?.toString()) {
      await createNotification(
        chuHoUser._id,
        'success',
        'Hộ khẩu đã được duyệt',
        `Hộ khẩu ${hoKhau.soHoKhau} đã được phê duyệt`,
        `/dashboard/hokhau/${hoKhau._id}`
      );
    }

    console.log('✅ [PATCH /:id/approve] Approved successfully');

    res.json({
      success: true,
      message: '✅ Đã duyệt hộ khẩu!',
      data: hoKhau
    });
  } catch (error) {
    console.error('❌ [PATCH /:id/approve] Error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ========== 7. REJECT ==========
router.patch('/:id/reject', authenticate, authorize('admin', 'to_truong'), async (req, res) => {
  try {
    const { reason } = req.body;

    console.log('❌ [PATCH /:id/reject] Rejecting hộ khẩu:', req.params.id);

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({ 
        success: false,
        message: 'Vui lòng nhập lý do từ chối (tối thiểu 10 ký tự)' 
      });
    }

    const hoKhau = await HoKhau.findById(req.params.id).populate('chuHo');

    if (!hoKhau) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy hộ khẩu' 
      });
    }

    if (hoKhau.trangThai !== 'pending') {
      return res.status(400).json({ 
        success: false,
        message: 'Chỉ có thể từ chối hộ khẩu đang chờ duyệt' 
      });
    }

    // ← GỬI THÔNG BÁO TRƯỚC KHI XÓA
    if (hoKhau.nguoiTao) {
      await createNotification(
        hoKhau.nguoiTao,
        'error',
        'Hộ khẩu bị từ chối',
        `Hộ khẩu ${hoKhau.soHoKhau} bị từ chối. Lý do: ${reason}`,
        null
      );
    }

    const chuHoUser = await User.findOne({ nhanKhauId: hoKhau.chuHo._id });
    if (chuHoUser && chuHoUser._id.toString() !== hoKhau.nguoiTao?.toString()) {
      await createNotification(
        chuHoUser._id,
        'error',
        'Hộ khẩu bị từ chối',
        `Hộ khẩu ${hoKhau.soHoKhau} bị từ chối. Lý do: ${reason}`,
        null
      );
    }

    // ← XÓA
    await HoKhau.findByIdAndDelete(req.params.id);
    await NhanKhau.findByIdAndUpdate(hoKhau.chuHo._id, {
      $unset: { hoKhauId: "", quanHeVoiChuHo: "" }
    });

    console.log(`❌ [PATCH /:id/reject] Rejected & deleted: ${hoKhau.soHoKhau}`);

    res.json({
      success: true,
      message: '❌ Đã từ chối và xóa hộ khẩu'
    });
  } catch (error) {
    console.error('❌ [PATCH /:id/reject] Error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ========== 8. DELETE ==========
router.delete('/:id', authenticate, authorize('admin', 'to_truong'), async (req, res) => {
  try {
    console.log('🗑️ [DELETE /:id] Deleting hộ khẩu:', req.params.id);

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

    console.log('✅ [DELETE /:id] Deleted successfully');

    res.json({ 
      success: true,
      message: 'Xóa thành công' 
    });
  } catch (error) {
    console.error('❌ [DELETE /:id] Error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ========== 9. ADD MEMBER ==========
router.post('/:id/members', authenticate, authorize('admin', 'to_truong'), async (req, res) => {
  try {
    const { nhanKhauId, quanHeVoiChuHo } = req.body;

    console.log('➕ [POST /:id/members] Adding member:', { hoKhauId: req.params.id, nhanKhauId });

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

    if (nhanKhau.hoKhauId && nhanKhau.hoKhauId.toString() !== req.params.id) {
      return res.status(400).json({ 
        success: false,
        message: `Nhân khẩu đã thuộc hộ khẩu khác` 
      });
    }

    const daTonTai = hoKhau.thanhVien.some(tv => tv.toString() === nhanKhauId);
    if (daTonTai) {
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

    const updatedHoKhau = await HoKhau.findById(req.params.id)
      .populate('chuHo', 'hoTen canCuocCongDan')
      .populate('thanhVien', 'hoTen canCuocCongDan ngaySinh gioiTinh quanHeVoiChuHo');

    console.log('✅ [POST /:id/members] Added:', nhanKhau.hoTen);

    res.json({
      success: true,
      message: `✅ Đã thêm ${nhanKhau.hoTen} vào hộ khẩu`,
      data: updatedHoKhau
    });
  } catch (error) {
    console.error('❌ [POST /:id/members] Error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ========== 10. REMOVE MEMBER ==========
router.delete('/:id/members/:memberId', authenticate, authorize('admin', 'to_truong'), async (req, res) => {
  try {
    console.log('➖ [DELETE /:id/members/:memberId] Removing member:', {
      hoKhauId: req.params.id,
      memberId: req.params.memberId
    });

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

    console.log('✅ [DELETE /:id/members/:memberId] Removed successfully');

    res.json({ 
      success: true,
      message: 'Xóa thành viên thành công' 
    });
  } catch (error) {
    console.error('❌ [DELETE /:id/members/:memberId] Error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

module.exports = router;