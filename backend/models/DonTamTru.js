const mongoose = require('mongoose');

const DonTamTruSchema = new mongoose.Schema({
  nhanKhauId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NhanKhau',
    required: true,
    index: true
  },
  diaChiTamTru: {
    type: String,
    required: true,
    trim: true
  },
  tuNgay: {
    type: Date,
    required: true
  },
  denNgay: {
    type: Date,
    required: true
  },
  lyDo: {
    type: String,
    required: true,
    trim: true
  },
  ghiChu: {
    type: String,
    trim: true
  },
  nguoiTao: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  trangThai: {
    type: String,
    enum: ['cho_xu_ly', 'da_xu_ly'],
    default: 'cho_xu_ly'
  },
  nguoiXuLy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  ngayXuLy: Date,
  lyDoTuChoi: {  
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

DonTamTruSchema.index({ nhanKhauId: 1, trangThai: 1 });

module.exports = mongoose.model('DonTamTru', DonTamTruSchema);