const mongoose = require('mongoose');

const phieuThuSchema = new mongoose.Schema({
  maPhieuThu: {
    type: String,
    unique: true,
    required: true
  },
  hoKhauId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HoKhau',
    required: true
  },
  khoanThuId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KhoanThu',
    required: true
  },
  soTien: {
    type: Number,
    required: true,
    min: 0
  },
  ngayDong: Date,
  trangThai: {
    type: String,
    enum: ['Chưa đóng', 'Đã đóng', 'Quá hạn'],
    default: 'Chưa đóng'
  },
  nguoiThuTien: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Auto-generate maPhieuThu
phieuThuSchema.pre('save', async function(next) {
  if (!this.maPhieuThu) {
    const count = await mongoose.model('PhieuThu').countDocuments();
    this.maPhieuThu = `PT${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('PhieuThu', phieuThuSchema);