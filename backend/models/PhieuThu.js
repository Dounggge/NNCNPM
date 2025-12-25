const mongoose = require('mongoose');

const phieuThuSchema = new mongoose.Schema({
  maPhieuThu: {
    type: String,
    unique: true,
    // ← XÓA: required: true (vì sẽ tự động generate)
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
  trangThai: {
    type: String,
    enum: ['Chưa đóng', 'Đã đóng'],
    default: 'Chưa đóng'
  },
  ngayDong: { type: Date },
  nguoiThuTien: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// ⭐ SỬA: Auto-generate maPhieuThu TRƯỚC KHI VALIDATE
phieuThuSchema.pre('validate', async function(next) {
  if (!this.maPhieuThu) {
    try {
      const count = await mongoose.model('PhieuThu').countDocuments();
      this.maPhieuThu = `PT${String(count + 1).padStart(6, '0')}`;
      console.log(`✅ Generated maPhieuThu: ${this.maPhieuThu}`);
    } catch (error) {
      console.error('❌ Error generating maPhieuThu:', error);
    }
  }
  next();
});

module.exports = mongoose.model('PhieuThu', phieuThuSchema);