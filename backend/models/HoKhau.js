const mongoose = require('mongoose');

const hoKhauSchema = new mongoose.Schema({
  soHoKhau: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  id: {
    type: String,
    unique: true
  },
  diaChiThuongTru: {
    type: String,
    required: true
  },
  ngayLap: {
    type: Date,
    default: Date.now
  },
  chuHo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NhanKhau',
    required: true
  },
  // ← ĐƠN GIẢN: CHỈ LÀ ARRAY OF ObjectId
  thanhVien: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NhanKhau'
  }],
  trangThai: {
    type: String,
    enum: ['pending', 'active', 'inactive'],
    default: 'pending'
  },
  nguoiTao: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Auto-generate id
hoKhauSchema.pre('save', async function(next) {
  if (!this.id) {
    this.id = this.soHoKhau;
  }
  next();
});

module.exports = mongoose.model('HoKhau', hoKhauSchema);