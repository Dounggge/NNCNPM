const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  hoTen: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: false, // Optional
    unique: true,
    sparse: true, // Allow null
    lowercase: true,
    trim: true
  },
  canCuocCongDan: { // Thêm field này để link với NhanKhau
    type: String,
    unique: true,
    sparse: true,
    length: 12
  },
  nhanKhauId: { // Reference to NhanKhau
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NhanKhau',
    required: false
  },
  vaiTro: {
    type: String,
    enum: [
      'admin',        // Quản trị viên hệ thống
      'to_truong',    // Tổ trưởng tổ dân phố
      'ke_toan',      // Kế toán (quản lý thu phí)
      'chu_ho',       // Chủ hộ
      'dan_cu'        // Dân cư thông thường
    ],
    default: 'dan_cu'
  },
  trangThai: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  ngayTao: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password trước khi save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);