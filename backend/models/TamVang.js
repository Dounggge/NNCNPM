const mongoose = require('mongoose');

const tamVangSchema = new mongoose.Schema({
  nhanKhauId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NhanKhau',
    required: [true, 'Nhân khẩu là bắt buộc']
  },
  noiDen: {
    type: String,
    required: [true, 'Nơi đến là bắt buộc']
  },
  tuNgay: {
    type: Date,
    required: [true, 'Ngày bắt đầu là bắt buộc']
  },
  denNgay: {
    type: Date,
    required: [true, 'Ngày kết thúc là bắt buộc']
  },
  lyDo: {
    type: String,
    required: [true, 'Lý do tạm vắng là bắt buộc']
  },
  trangThai: {
    type: String,
    enum: ['cho_duyet', 'da_duyet', 'tu_choi', 'het_han'],
    default: 'cho_duyet'
  },
  ghiChu: {
    type: String
  },
  nguoiDuyet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  ngayDuyet: {
    type: Date
  }
}, {
  timestamps: true
});

// Index để tìm kiếm nhanh
tamVangSchema.index({ nhanKhauId: 1, trangThai: 1 });
tamVangSchema.index({ tuNgay: 1, denNgay: 1 });

module.exports = mongoose.model('TamVang', tamVangSchema);