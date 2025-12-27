const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth'); // ← SỬA
const PhieuThu = require('../models/PhieuThu');
const KhoanThu = require('../models/KhoanThu');

// GET /api/phieuthu - Lấy danh sách phiếu thu
router.get('/', authenticate, async (req, res) => { // ← SỬA
  try {
    const { 
      page = 1, 
      limit = 10, 
      trangThai, 
      thang, 
      nam,
      search 
    } = req.query;
    
    // Xây dựng query lọc
    const query = {};
    if (trangThai) query.trangThai = trangThai;
    if (thang) query.thang = parseInt(thang);
    if (nam) query.nam = parseInt(nam);
    
    // Xử lý tìm kiếm theo số hộ khẩu hoặc tên chủ hộ
    if (search && search.trim() !== '') {
      const hoKhaus = await HoKhau.find({
        $or: [
          { soHoKhau: { $regex: search, $options: 'i' } },
          { 'chuHo.hoTen': { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      if (hoKhaus.length > 0) {
        query.hoKhauId = { $in: hoKhaus.map(h => h._id) };
      } else {
        // Nếu không tìm thấy hộ khẩu nào khớp, trả về mảng rỗng
        return res.json({
          success: true,
          data: [],
          pagination: {
            total: 0,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: 0
          }
        });
      }
    }
    
    // Đếm tổng số bản ghi (cho phân trang)
    const total = await PhieuThu.countDocuments(query);
    
    // Lấy dữ liệu với populate và phân trang
    const phieuThus = await PhieuThu.find(query)
      .populate('hoKhauId', 'soHoKhau chuHo')
      .populate('khoanThuId', 'tenKhoanThu donGia donVi')
      .populate('nguoiThuTien', 'hoTen')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 }); // Sắp xếp mới nhất trước
    
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
    console.error('Error fetching phieu thus:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi lấy danh sách phiếu thu' 
    });
  }
});

// 2. GET /api/phieuthu/:id - Lấy CHI TIẾT 1 phiếu thu (dùng cho PhieuThuDetail)
router.get('/:id', authenticate, async (req, res) => {
  try {
    // Kiểm tra ID có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID phiếu thu không hợp lệ' 
      });
    }
    
    const phieuThu = await PhieuThu.findById(req.params.id)
      .populate('hoKhauId', 'soHoKhau diaChiThuongTru chuHo')
      .populate('khoanThuId', 'tenKhoanThu donGia donVi')
      .populate('nguoiThuTien', 'hoTen email');
    
    if (!phieuThu) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy phiếu thu với ID này' 
      });
    }
    
    res.json({ 
      success: true, 
      data: phieuThu 
    });
  } catch (error) {
    console.error('Error fetching phieu thu detail:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi lấy chi tiết phiếu thu' 
    });
  }
});

// POST /api/phieuthu - Tạo phiếu thu
router.post('/', authenticate, authorize('admin', 'to_truong', 'ke_toan'), async (req, res) => { 
  try {
    const { hoKhauId, khoanThuId } = req.body;

    if (!hoKhauId || !khoanThuId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu hộ khẩu hoặc khoản thu'
      });
    }

    const khoanThu = await KhoanThu.findById(khoanThuId);
    if (!khoanThu) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khoản thu'
      });
    }

    const phieuThu = await PhieuThu.create({
      hoKhauId,
      khoanThuId,
      soTien: khoanThu.donGia, // ← SỬA: khoanThu.soTien → khoanThu.donGia
      trangThai: 'Chưa đóng'
    });

    res.status(201).json({ success: true, data: phieuThu });
  } catch (error) {
    console.error('Error creating phieu thu:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Lỗi khi tạo phiếu thu' 
    });
  }
});

// PUT /api/phieuthu/:id/paid - Đánh dấu đã thanh toán
router.put('/:id/paid', authenticate, authorize('admin', 'to_truong', 'ke_toan'), async (req, res) => { 
  try {
    const phieuThu = await PhieuThu.findByIdAndUpdate(
      req.params.id,
      { 
        trangThai: 'da_thanh_toan',
        ngayDong: new Date(),
        nguoiThuTien: req.user._id // Lấy ID user từ middleware auth
      },
      { new: true, runValidators: true }
    ).populate('nguoiThuTien', 'hoTen email');
    
    if (!phieuThu) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy phiếu thu' 
      });
    }
    
    res.json({ 
      success: true, 
      data: phieuThu,
      message: 'Đã xét duyệt thanh toán thành công'
    });
  } catch (error) {
    console.error('Error marking phieu thu as paid:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Lỗi khi xét duyệt thanh toán' 
    });
  }
});

// DELETE /api/phieuthu/:id - Xóa phiếu thu
router.delete('/:id', authenticate, authorize('admin', 'to_truong', 'ke_toan'), async (req, res) => { // ← SỬA
  try {
    const phieuThu = await PhieuThu.findByIdAndDelete(req.params.id);
    
    if (!phieuThu) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy phiếu thu' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Đã xóa phiếu thu thành công' 
    });
  } catch (error) {
    console.error('Error deleting phieu thu:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Lỗi khi xóa phiếu thu' 
    });
  }
});

module.exports = router;