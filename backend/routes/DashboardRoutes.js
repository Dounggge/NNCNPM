const express = require('express');
const router = express.Router();
const NhanKhau = require('../models/NhanKhau');
const HoKhau = require('../models/HoKhau');
const PhieuThu = require('../models/PhieuThu');
const { authenticate } = require('../middleware/auth'); // ← SỬA: authMiddleware → authenticate

// Thống kê tổng quan
router.get('/stats', authenticate, async (req, res) => { // ← SỬA
  try {
    const tongHoKhau = await HoKhau.countDocuments();
    const tongNhanKhau = await NhanKhau.countDocuments();
    
    // Thống kê theo độ tuổi
    const now = new Date();
    const tuoiGroups = await NhanKhau.aggregate([
      {
        $addFields: {
          tuoi: {
            $divide: [
              { $subtract: [now, '$ngaySinh'] },
              1000 * 60 * 60 * 24 * 365
            ]
          }
        }
      },
      {
        $bucket: {
          groupBy: '$tuoi',
          boundaries: [0, 18, 36, 61, 120],
          default: 'Khác',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    // Phân bố độ tuổi
    const phanBoDoTuoi = [
      { label: '0-17 tuổi', value: tuoiGroups.find(g => g._id === 0)?.count || 0, percentage: 0 },
      { label: '18-35 tuổi', value: tuoiGroups.find(g => g._id === 18)?.count || 0, percentage: 0 },
      { label: '36-60 tuổi', value: tuoiGroups.find(g => g._id === 36)?.count || 0, percentage: 0 },
      { label: 'Trên 60 tuổi', value: tuoiGroups.find(g => g._id === 61)?.count || 0, percentage: 0 }
    ];

    // Tính phần trăm
    phanBoDoTuoi.forEach(group => {
      group.percentage = tongNhanKhau > 0 
        ? Math.round((group.value / tongNhanKhau) * 100) 
        : 0;
    });

    // Thống kê phiếu thu
    const tongPhieuThu = await PhieuThu.countDocuments();
    const phieuDaDong = await PhieuThu.countDocuments({ trangThai: 'Đã đóng' });
    const phieuChuaDong = await PhieuThu.countDocuments({ trangThai: 'Chưa đóng' });

    // Tăng trưởng so với tháng trước
    const thangTruoc = new Date();
    thangTruoc.setMonth(thangTruoc.getMonth() - 1);

    const hoKhauThangTruoc = await HoKhau.countDocuments({ createdAt: { $lt: thangTruoc } });
    const nhanKhauThangTruoc = await NhanKhau.countDocuments({ createdAt: { $lt: thangTruoc } });

    const tangTruongHoKhau = hoKhauThangTruoc > 0 
      ? ((tongHoKhau - hoKhauThangTruoc) / hoKhauThangTruoc * 100).toFixed(1)
      : 0;
    
    const tangTruongNhanKhau = nhanKhauThangTruoc > 0
      ? ((tongNhanKhau - nhanKhauThangTruoc) / nhanKhauThangTruoc * 100).toFixed(1)
      : 0;

    res.json({
      tongHoKhau,
      tongNhanKhau,
      tongPhieuThu,
      phieuDaDong,
      phieuChuaDong,
      tangTruongHoKhau: parseFloat(tangTruongHoKhau),
      tangTruongNhanKhau: parseFloat(tangTruongNhanKhau),
      phanBoDoTuoi
    });
  } catch (error) {
    console.error('❌ Stats error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Biểu đồ tăng trưởng dân số 12 tháng
router.get('/growth-chart', authenticate, async (req, res) => { // ← SỬA
  try {
    const now = new Date();
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(now.getMonth() - 12);

    const growthData = await NhanKhau.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    const data = months.map((month, index) => {
      const found = growthData.find(d => d._id.month === index + 1);
      return found ? found.count : 0;
    });

    res.json({
      labels: months,
      data
    });
  } catch (error) {
    console.error('❌ Growth chart error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

module.exports = router;