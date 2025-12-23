const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  nguoiGui: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  loaiPhanHoi: {
    type: String,
    enum: ['gop_y', 'khieu_nai', 'hoi_dap'],
    default: 'gop_y'
  },
  tieuDe: {
    type: String,
    required: true,
    trim: true
  },
  noiDung: {
    type: String,
    required: true
  },
  email: {
    type: String,
    trim: true
  },
  soDienThoai: {
    type: String,
    trim: true
  },
  trangThai: {
    type: String,
    enum: ['chua_xu_ly', 'dang_xu_ly', 'da_xu_ly'],
    default: 'chua_xu_ly'
  },
  nguoiXuLy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  noiDungTraLoi: {
    type: String
  },
  ngayTraLoi: {
    type: Date
  }
}, {
  timestamps: true
});

// ← INDEX
FeedbackSchema.index({ nguoiGui: 1, createdAt: -1 });
FeedbackSchema.index({ trangThai: 1 });

module.exports = mongoose.model('Feedback', FeedbackSchema);