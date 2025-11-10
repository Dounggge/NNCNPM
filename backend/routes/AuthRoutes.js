const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const NhanKhau = require('../models/NhanKhau');

// Register - Dùng CCCD hoặc tự đặt username
router.post('/register', async (req, res) => {
  try {
    console.log('📝 Register request:', req.body);

    const { canCuocCongDan, hoTen, password, userName } = req.body;

    // Validate
    if (!canCuocCongDan || !hoTen || !password) {
      return res.status(400).json({ 
        message: 'Vui lòng điền đầy đủ thông tin' 
      });
    }

    if (canCuocCongDan.length !== 12) {
      return res.status(400).json({ 
        message: 'Căn cước công dân phải có 12 số' 
      });
    }

    // Check if CCCD exists in NhanKhau
    let nhanKhau = await NhanKhau.findOne({ canCuocCongDan });
    
    // Nếu chưa có trong NhanKhau, tạo mới (optional - tùy logic của bạn)
    if (!nhanKhau) {
      nhanKhau = await NhanKhau.create({
        canCuocCongDan,
        hoTen,
        ngaySinh: new Date(), // Placeholder
        gioiTinh: 'Khac'
      });
    }

    // Check if User already exists
    const existingUser = await User.findOne({ 
      $or: [
        { canCuocCongDan },
        { userName: userName || canCuocCongDan }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'Tài khoản hoặc căn cước công dân đã tồn tại' 
      });
    }

    // Determine role
    let vaiTro = 'dan_cu';
    if (nhanKhau.quanHeVoiChuHo === 'Chủ hộ') {
      vaiTro = 'chu_ho';
    }

    // Create User account
    const newUser = new User({
      userName: userName || canCuocCongDan, // Use custom username or CCCD
      password: password,
      hoTen,
      canCuocCongDan,
      nhanKhauId: nhanKhau._id,
      vaiTro
    });

    await newUser.save();

    // Update NhanKhau with userId
    nhanKhau.userId = newUser._id;
    await nhanKhau.save();

    console.log('✅ User created:', newUser._id);

    res.status(201).json({ 
      message: 'Đăng ký thành công',
      user: {
        id: newUser._id,
        userName: newUser.userName,
        hoTen: newUser.hoTen,
        vaiTro: newUser.vaiTro
      }
    });
  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({ 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
});

// Login - Dùng UserName HOẶC CCCD
router.post('/login', async (req, res) => {
  try {
    console.log('🔐 Login request:', req.body);

    const { canCuocCongDan, password } = req.body;

    if (!canCuocCongDan || !password) {
      return res.status(400).json({ 
        message: 'Vui lòng nhập đầy đủ thông tin' 
      });
    }

    // Find user by userName OR canCuocCongDan
    const user = await User.findOne({ 
      $or: [
        { userName: canCuocCongDan },
        { canCuocCongDan: canCuocCongDan }
      ]
    }).populate('nhanKhauId');

    if (!user) {
      return res.status(401).json({ 
        message: 'Tài khoản không tồn tại' 
      });
    }

    // Check active status
    if (user.trangThai !== 'active') {
      return res.status(401).json({ 
        message: 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        message: 'Mật khẩu không đúng' 
      });
    }

    // Generate token
    const token = jwt.sign(
      { 
        id: user._id, 
        userName: user.userName,
        vaiTro: user.vaiTro 
      },
      process.env.JWT_SECRET || 'your-secret-key-change-me',
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful:', user._id);

    res.json({ 
      token, 
      user: {
        id: user._id,
        userName: user.userName,
        hoTen: user.hoTen,
        canCuocCongDan: user.canCuocCongDan,
        vaiTro: user.vaiTro,
        email: user.email,
        nhanKhau: user.nhanKhauId
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
});

module.exports = router;