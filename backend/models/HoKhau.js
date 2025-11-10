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
  ngayDangKy: {
    type: Date,
    default: Date.now
  },
  chuHo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NhanKhau',
    required: true
  },
  thanhVien: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NhanKhau'
  }]
}, {
  timestamps: true
});

// Auto-generate soHoKhau
hoKhauSchema.pre('save', async function(next) {
  if (!this.soHoKhau) {
    const count = await mongoose.model('HoKhau').countDocuments();
    this.soHoKhau = `HK${String(count + 1).padStart(6, '0')}`;
  }
  if (!this.id) {
    this.id = this.soHoKhau;
  }
  next();
});

module.exports = mongoose.model('HoKhau', hoKhauSchema);