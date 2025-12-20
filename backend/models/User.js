const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  userName: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  hoTen: { 
    type: String, 
    required: true 
  },
  canCuocCongDan: { 
    type: String, 
    required: true, 
    unique: true 
  },
  email: { 
    type: String,
    // ← BỎ unique: true
    sparse: true, // ← CHO PHÉP NHIỀU NULL
    validate: {
      validator: function(v) {
        // Chỉ validate nếu có giá trị
        if (!v) return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Email không hợp lệ'
    }
  },
  vaiTro: { 
    type: String, 
    enum: ['admin', 'to_truong', 'ke_toan', 'chu_ho', 'dan_cu'], 
    default: 'dan_cu' 
  },
  nhanKhauId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'NhanKhau' 
  },
  trangThai: { 
    type: String, 
    enum: ['active', 'inactive'], 
    default: 'active' 
  }
}, {
  timestamps: true
});

// Hash password before save
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);