const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');
const bcrypt = require('bcryptjs'); 

router.post('/create-from-nhankhau', authenticate, authorize('admin', 'to_truong'), async (req, res) => {
  try {
    const { nhanKhauId, vaiTro = 'dan_cu' } = req.body;

    if (!nhanKhauId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu nhanKhauId'
      });
    }

    const NhanKhau = require('../models/NhanKhau');
    const nhanKhau = await NhanKhau.findById(nhanKhauId);
    
    if (!nhanKhau) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhân khẩu'
      });
    }

    if (nhanKhau.userId) {
      return res.status(400).json({
        success: false,
        message: 'Nhân khẩu này đã có tài khoản'
      });
    }

    const existingUser = await User.findOne({ userName: nhanKhau.canCuocCongDan });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Số CCCD này đã được dùng làm tài khoản'
      });
    }

    const newUser = new User({
      userName: nhanKhau.canCuocCongDan,
      password: nhanKhau.canCuocCongDan,
      vaiTro: vaiTro,
      nhanKhauId: nhanKhau._id,
      hoTen: nhanKhau.hoTen
    });

    await newUser.save();

    nhanKhau.userId = newUser._id;
    await nhanKhau.save();

    return res.status(201).json({
      success: true,
      data: {
        _id: newUser._id,
        userName: newUser.userName,
        vaiTro: newUser.vaiTro
      },
      message: `Đã tạo tài khoản với vai trò "${vaiTro}"`
    });
  } catch (error) {
    console.error('❌ Create user error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET ALL USERS
router.get('/', authenticate, authorize('admin', 'to_truong'), async (req, res) => {
  try {
    const users = await User.find()
      .populate('nhanKhauId', 'hoTen canCuocCongDan ngaySinh')
      .select('-password')
      .sort({ createdAt: -1 });

    const formattedUsers = users.map(user => ({
      ...user.toObject(),
      role: user.vaiTro,
      username: user.userName
    }));

    res.json({
      success: true,
      data: formattedUsers
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// UPDATE ROLE
router.put('/:userId/role', authenticate, authorize('admin', 'to_truong'), async (req, res) => {
  try {
    const { role, vaiTro } = req.body;
    const newRole = vaiTro || role;

    console.log('🔄 [PUT /:userId/role] Request:', {
      userId: req.params.userId,
      currentUserRole: req.user.vaiTro,
      newRole
    });

    if (!newRole) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu vai trò'
      });
    }

    let allowedRoles = [];

    if (req.user.vaiTro === 'admin') {
      allowedRoles = ['admin', 'to_truong', 'ke_toan', 'chu_ho', 'dan_cu'];
    }

    if (req.user.vaiTro === 'to_truong') {
      allowedRoles = ['ke_toan', 'chu_ho', 'dan_cu'];
    }

    if (!allowedRoles.includes(newRole)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền gán vai trò này'
      });
    }

    if (req.user._id.toString() === req.params.userId) {
      return res.status(403).json({
        success: false,
        message: 'Không thể tự thay đổi vai trò của mình'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { vaiTro: newRole },
      { new: true, runValidators: true }
    )
      .select('-password')
      .populate('nhanKhauId', 'hoTen canCuocCongDan');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User không tồn tại'
      });
    }

    console.log(`✅ [PUT /:userId/role] Updated: ${user.userName} → ${newRole}`);

    res.json({
      success: true,
      message: `✅ Đã cập nhật vai trò thành ${newRole}`,
      data: {
        _id: user._id,
        userName: user.userName,
        hoTen: user.hoTen,
        vaiTro: user.vaiTro,
        role: user.vaiTro,
        trangThai: user.trangThai,
        nhanKhauId: user.nhanKhauId
      }
    });
  } catch (error) {
    console.error('❌ [PUT /:userId/role] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// UPDATE STATUS
router.put('/:userId/status', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { trangThai } = req.body;
    
    if (!trangThai || !['active', 'inactive'].includes(trangThai)) {
      return res.status(400).json({ 
        success: false,
        message: 'Trạng thái không hợp lệ' 
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { trangThai },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User không tồn tại' 
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật trạng thái thành công',
      user: {
        ...user.toObject(),
        role: user.vaiTro,
        username: user.userName
      }
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ========== ĐỔI MẬT KHẨU ==========
router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    console.log('🔐 [CHANGE PASSWORD] Request:', {
      userId: req.user._id,
      userName: req.user.userName,
      hasOldPassword: !!oldPassword,
      hasNewPassword: !!newPassword
    });

    // VALIDATE
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin!' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự!' });
    }

    // TÌM USER
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
    }

    // ← XÁC ĐỊNH FIELD MẬT KHẨU (password hoặc matKhau)
    const passwordField = user.password !== undefined ? 'password' : 'matKhau';
    console.log(`🔍 Password field detected: "${passwordField}"`);

    // KIỂM TRA MẬT KHẨU CŨ
    const isMatch = await bcrypt.compare(oldPassword, user[passwordField]);
    if (!isMatch) {
      console.log('❌ Old password incorrect');
      return res.status(400).json({ message: 'Mật khẩu cũ không đúng!' });
    }

    // KIỂM TRA MẬT KHẨU MỚI KHÁC CŨ
    const isSame = await bcrypt.compare(newPassword, user[passwordField]);
    if (isSame) {
      console.log('❌ New password same as old');
      return res.status(400).json({ message: 'Mật khẩu mới phải khác mật khẩu cũ!' });
    }

    // MÃ HÓA MẬT KHẨU MỚI
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    user[passwordField] = hashedPassword;

    await user.save();

    console.log('✅ Password changed successfully for user:', user.userName);

    res.json({ 
      message: 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.',
      success: true 
    });
  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
});

module.exports = router;