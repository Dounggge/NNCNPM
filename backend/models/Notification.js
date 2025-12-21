const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'ho_khau_moi',
      'ho_khau_duyet',
      'ho_khau_tu_choi',
      'don_xin_vao_ho',
      'don_xin_duyet',
      'phieu_thu_moi',
      'vai_tro_thay_doi',
      'thong_bao_chung'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  link: String,
  isRead: {
    type: Boolean,
    default: false
  },
  relatedId: mongoose.Schema.Types.ObjectId
}, {
  timestamps: true
});

NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);