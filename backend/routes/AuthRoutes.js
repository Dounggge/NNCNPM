const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const NhanKhau = require('../models/NhanKhau');
const { authenticate } = require('../middleware/auth');

// ========== REGISTER: CHỈ TẠO USER, KHÔNG TỰ ĐỘNG TẠO NHANKHAU ==========
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

    // ← KIỂM TRA USER ĐÃ TỒN TẠI CHƯA
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

    // ← KIỂM TRA CCCD ĐÃ CÓ TRONG NHANKHAU CHƯA (OPTIONAL)
    let nhanKhau = await NhanKhau.findOne({ canCuocCongDan });
    
    // ← XÁC ĐỊNH VAI TRÒ
    let vaiTro = 'dan_cu'; // Mặc định
    if (nhanKhau?.quanHeVoiChuHo === 'Chủ hộ') {
      vaiTro = 'chu_ho';
    }

    // ← TẠO USER (KHÔNG TẠO NHANKHAU NẾU CHƯA CÓ)
    const newUser = new User({
      userName: userName || canCuocCongDan,
      password: password,
      hoTen,
      canCuocCongDan,
      nhanKhauId: nhanKhau?._id || null, // ← NULL nếu chưa có NhanKhau
      vaiTro
    });

    await newUser.save();

    // ← NẾU ĐÃ CÓ NHANKHAU, GẮN userId VÀO
    if (nhanKhau) {
      nhanKhau.userId = newUser._id;
      await nhanKhau.save();
    }

    console.log('✅ User created:', newUser._id);

    res.status(201).json({ 
      message: nhanKhau 
        ? 'Đăng ký thành công! Tài khoản đã được liên kết với thông tin nhân khẩu.' 
        : 'Đăng ký thành công! Vui lòng khai báo thông tin cá nhân.',
      user: {
        id: newUser._id,
        userName: newUser.userName,
        hoTen: newUser.hoTen,
        vaiTro: newUser.vaiTro,
        hasProfile: !!nhanKhau
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

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const permissions = {
      admin: ['all'],
      to_truong: ['nhankhau:*', 'hokhau:*', 'dashboard:read'],
      ke_toan: ['thuhi:*', 'hokhau:read', 'nhankhau:read', 'dashboard:read'],
      chu_ho: ['hokhau:read', 'hokhau:update', 'nhankhau:read'],
      dan_cu: ['nhankhau:read']
    };

    res.json({
      success: true,
      data: {
        id: req.user._id,
        userName: req.user.userName,
        hoTen: req.user.hoTen,
        canCuocCongDan: req.user.canCuocCongDan,
        vaiTro: req.user.vaiTro,
        email: req.user.email,
        nhanKhauId: req.user.nhanKhauId,
        permissions: permissions[req.user.vaiTro] || []
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server', 
      error: error.message 
    });
  }
});

// PUT /api/auth/link-profile - Liên kết nhân khẩu với user
router.put('/link-profile', authenticate, async (req, res) => {
  try {
    const { nhanKhauId } = req.body;
    
    if (!nhanKhauId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu nhanKhauId'
      });
    }
    
    // Kiểm tra NhanKhau có tồn tại không
    const nhanKhau = await NhanKhau.findById(nhanKhauId);
    if (!nhanKhau) {
      return res.status(404).json({
        success: false,
        message: 'Nhân khẩu không tồn tại'
      });
    }
    
    // ← KIỂM TRA CCCD CÓ KHỚP KHÔNG (BẢO MẬT)
    if (nhanKhau.canCuocCongDan !== req.user.canCuocCongDan) {
      return res.status(403).json({
        success: false,
        message: 'CCCD không khớp với tài khoản hiện tại'
      });
    }
    
    // Cập nhật User
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { nhanKhauId },
      { new: true, runValidators: true }
    )
      .select('-password')
      .populate('nhanKhauId', 'hoTen canCuocCongDan');
    
    // Cập nhật NhanKhau với userId
    nhanKhau.userId = user._id;
    await nhanKhau.save();
    
    res.json({
      success: true,
      message: 'Liên kết thành công',
      data: user
    });
  } catch (error) {
    console.error('❌ Link profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;