const express = require('express');
const router = express.Router();
const NhanKhau = require('../models/NhanKhau');
const HoKhau = require('../models/HoKhau');
const PhieuThu = require('../models/PhieuThu');
const User = require('../models/User');
const { authenticate, checkPermission } = require('../middleware/auth'); 

// Thống kê tổng quan
router.get('/stats', authenticate, async (req, res) => { 
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

// NEW - Admin Dashboard Stats
router.get('/admin-stats', authenticate, checkPermission('dashboard:read'), async (req, res) => {
  try {
    // Thống kê cơ bản
    const tongNhanKhau = await NhanKhau.countDocuments({ trangThai: 'thuong_tru' });
    const tongHoKhau = await HoKhau.countDocuments();
    const tongUsers = await User.countDocuments();
    
    // Thống kê nhân khẩu theo loại
    const tamTru = await NhanKhau.countDocuments({ trangThai: 'tam_tru' });
    const tamVang = await NhanKhau.countDocuments({ trangThai: 'tam_vang' });
    const daChuyenDi = await NhanKhau.countDocuments({ trangThai: 'da_chuyen_di' });
    
    // Thống kê users theo vai trò
    const usersByRole = await User.aggregate([
      { $group: { _id: '$vaiTro', count: { $sum: 1 } } }
    ]);
    
    const roleStats = {
      admin: 0,
      to_truong: 0,
      ke_toan: 0,
      chu_ho: 0,
      dan_cu: 0
    };
    
    usersByRole.forEach(role => {
      roleStats[role._id] = role.count;
    });

    // Phân bố giới tính
    const genderStats = await NhanKhau.aggregate([
      { $match: { trangThai: 'thuong_tru' } },
      { $group: { _id: '$gioiTinh', count: { $sum: 1 } } }
    ]);

    const gioiTinhStats = {
      nam: 0,
      nu: 0,
      khac: 0
    };

    genderStats.forEach(g => {
      const key = g._id?.toLowerCase() || 'khac';
      gioiTinhStats[key] = g.count;
    });

    // Phân bố độ tuổi
    const today = new Date();
    const ageGroups = await NhanKhau.aggregate([
      { $match: { trangThai: 'thuong_tru', ngaySinh: { $exists: true } } },
      {
        $project: {
          age: {
            $floor: {
              $divide: [
                { $subtract: [today, '$ngaySinh'] },
                1000 * 60 * 60 * 24 * 365.25
              ]
            }
          }
        }
      },
      {
        $bucket: {
          groupBy: '$age',
          boundaries: [0, 18, 36, 61, 150],
          default: 'Khác',
          output: { count: { $sum: 1 } }
        }
      }
    ]);

    const phanBoDoTuoi = [
      { label: '0-17 tuổi', value: 0, percentage: 0 },
      { label: '18-35 tuổi', value: 0, percentage: 0 },
      { label: '36-60 tuổi', value: 0, percentage: 0 },
      { label: 'Trên 60 tuổi', value: 0, percentage: 0 }
    ];

    ageGroups.forEach((group, index) => {
      if (index < 4) {
        phanBoDoTuoi[index].value = group.count;
        phanBoDoTuoi[index].percentage = tongNhanKhau > 0 
          ? Math.round((group.count / tongNhanKhau) * 100) 
          : 0;
      }
    });

    // Thống kê phiếu thu
    const tongPhieuThu = await PhieuThu.countDocuments();
    const phieuDaDong = await PhieuThu.countDocuments({ trangThaiDong: 'da_dong' });
    const phieuChuaDong = await PhieuThu.countDocuments({ trangThaiDong: 'chua_dong' });
    
    // Tổng tiền thu
    const thongKeTien = await PhieuThu.aggregate([
      {
        $group: {
          _id: '$trangThaiDong',
          total: { $sum: '$soTien' }
        }
      }
    ]);

    let tongTienDaThu = 0;
    let tongTienConLai = 0;

    thongKeTien.forEach(item => {
      if (item._id === 'da_dong') {
        tongTienDaThu = item.total;
      } else {
        tongTienConLai = item.total;
      }
    });

    // Hộ khẩu mới trong tháng
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const hoKhauMoiThangNay = await HoKhau.countDocuments({ 
      createdAt: { $gte: startOfMonth } 
    });

    // Nhân khẩu mới trong tháng
    const nhanKhauMoiThangNay = await NhanKhau.countDocuments({ 
      createdAt: { $gte: startOfMonth } 
    });

    res.json({
      // Tổng quan
      tongNhanKhau,
      tongHoKhau,
      tongUsers,
      
      // Trạng thái nhân khẩu
      trangThaiNhanKhau: {
        thuongTru: tongNhanKhau,
        tamTru,
        tamVang,
        daChuyenDi
      },

      // Vai trò users
      vaiTroUsers: roleStats,

      // Giới tính
      gioiTinh: gioiTinhStats,

      // Độ tuổi
      phanBoDoTuoi,

      // Thu phí
      thuPhi: {
        tongPhieuThu,
        phieuDaDong,
        phieuChuaDong,
        tongTienDaThu,
        tongTienConLai,
        tongTien: tongTienDaThu + tongTienConLai,
        tyLeDong: tongPhieuThu > 0 
          ? Math.round((phieuDaDong / tongPhieuThu) * 100) 
          : 0
      },

      // Tăng trưởng
      tangTruong: {
        hoKhauMoiThangNay,
        nhanKhauMoiThangNay
      }
    });

  } catch (error) {
    console.error('❌ Dashboard error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

module.exports = router;