const mongoose = require('mongoose');

const khoanThuSchema = new mongoose.Schema({
  tenKhoanThu: {
    type: String,
    required: true
  },
  loaiKhoanThu: {
    type: String,
    enum: ['bat_buoc', 'dong_gop', 'dich_vu'],
    required: true
  },
  donGia: {
    type: Number,
    required: true,
    min: 0
  },
  donVi: {
    type: String,
    enum: ['VND/thang', 'VND/nguoi', 'VND/lan', 'VND/V'],
    default: 'VND'
  },
  batDau: {
    type: Date,
    required: true
  },
  ketThuc: {
    type: Date
  },
  moTa: String,
  nguoiTao: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('KhoanThu', khoanThuSchema);