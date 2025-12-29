const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const { authenticate, authorize } = require('../middleware/auth');
const { createNotification } = require('../utils/notificationHelper');
const User = require('../models/User');

// ========== CREATE FEEDBACK (USER) ==========
router.post('/', authenticate, async (req, res) => {
  try {
    const { loaiPhanHoi, tieuDe, noiDung, email, soDienThoai } = req.body;

    const feedback = await Feedback.create({
      nguoiGui: req.user._id,
      loaiPhanHoi,
      tieuDe,
      noiDung,
      email,
      soDienThoai
    });

    console.log('✅ Feedback created:', feedback._id);

    // ← SỬA CÁCH GỌI createNotification
    const admins = await User.find({ vaiTro: { $in: ['admin', 'to_truong'] } });
    
    const loaiText = loaiPhanHoi === 'gop_y' ? 'góp ý' : 
                     loaiPhanHoi === 'khieu_nai' ? 'khiếu nại' : 'câu hỏi';
    
    for (const admin of admins) {
      await createNotification(
        admin._id,                              // userId
        loaiPhanHoi === 'khieu_nai' ? 'warning' : 'info', // type
        `Phản hồi mới: ${tieuDe}`,             // title
        `${req.user.hoTen || req.user.userName} đã gửi ${loaiText}`, // message
        `/dashboard/feedbacks/${feedback._id}` // link
      );
    }

    res.status(201).json({
      success: true,
      message: '✅ Cảm ơn bạn đã gửi phản hồi! Chúng tôi sẽ xem xét sớm nhất.',
      data: feedback
    });
  } catch (error) {
    console.error('Create feedback error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== GET ALL FEEDBACKS (ADMIN/TỔ TRƯỞNG) ==========
router.get('/', authenticate, authorize('admin', 'to_truong'), async (req, res) => {
  try {
    const { trangThai, loaiPhanHoi, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (trangThai) filter.trangThai = trangThai;
    if (loaiPhanHoi) filter.loaiPhanHoi = loaiPhanHoi;

    const feedbacks = await Feedback.find(filter)
      .populate('nguoiGui', 'hoTen userName email')
      .populate('nguoiXuLy', 'hoTen userName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Feedback.countDocuments(filter);

    res.json({
      success: true,
      data: feedbacks,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get feedbacks error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== GET MY FEEDBACKS (USER) ==========
router.get('/my-feedbacks', authenticate, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ nguoiGui: req.user._id })
      .populate('nguoiXuLy', 'hoTen userName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: feedbacks
    });
  } catch (error) {
    console.error('Get my feedbacks error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== GET FEEDBACK BY ID ==========
router.get('/:id', authenticate, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('nguoiGui', 'hoTen userName email soDienThoai')
      .populate('nguoiXuLy', 'hoTen userName');

    if (!feedback) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy phản hồi' 
      });
    }

    const canView = 
      req.user.vaiTro === 'admin' || 
      req.user.vaiTro === 'to_truong' ||
      feedback.nguoiGui.toString() === req.user._id.toString();

    if (!canView) {
      return res.status(403).json({ 
        success: false, 
        message: 'Không có quyền xem phản hồi này' 
      });
    }

    res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== UPDATE STATUS & REPLY (ADMIN/TỔ TRƯỞNG) ==========
router.put('/:id/reply', authenticate, authorize('admin', 'to_truong'), async (req, res) => {
  try {
    const { trangThai, noiDungTraLoi } = req.body;

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy phản hồi' 
      });
    }

    feedback.trangThai = trangThai || 'da_xu_ly';
    feedback.nguoiXuLy = req.user._id;
    feedback.noiDungTraLoi = noiDungTraLoi;
    feedback.ngayTraLoi = new Date();

    await feedback.save();

    // ← SỬA CÁCH GỌI createNotification
    await createNotification(
      feedback.nguoiGui,                        // userId
      'success',                                // type
      'Phản hồi của bạn đã được xử lý',        // title
      `Chúng tôi đã trả lời: "${feedback.tieuDe}"`, // message
      `/dashboard/my-feedbacks`                 // link
    );

    console.log('✅ Feedback replied:', feedback._id);

    res.json({
      success: true,
      message: '✅ Đã trả lời phản hồi thành công',
      data: feedback
    });
  } catch (error) {
    console.error('Reply feedback error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== DELETE FEEDBACK (ADMIN) ==========
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy phản hồi' 
      });
    }

    console.log('✅ Feedback deleted:', req.params.id);

    res.json({
      success: true,
      message: '✅ Đã xóa phản hồi'
    });
  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;