const mongoose = require('mongoose');

const khoanThuSchema = new mongoose.Schema({
  tenKhoanThu: {
    type: String,
    required: true
  },
  loaiThu: {
    type: String,
    enum: ['Bắt buộc', 'Đóng góp', 'Phí dịch vụ'],
    required: true
  },
  soTien: {
    type: Number,
    required: true,
    min: 0
  },
  donViTinh: {
    type: String,
    enum: ['VNĐ/tháng', 'VNĐ/người', 'VNĐ/lần', 'VNĐ'],
    default: 'VNĐ'
  },
  ngayBatDau: {
    type: Date,
    required: true
  },
  ngayKetThuc: Date,
  moTa: String,
  nguoiTao: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('KhoanThu', khoanThuSchema);