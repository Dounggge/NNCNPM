const mongoose = require('mongoose');

const phieuThuSchema = new mongoose.Schema({
  maPhieuThu: {
    type: String,
    unique: true,
  },
  soPhieuThu: { // Alias
    type: String,
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
  tongTien: { // Alias cho soTien
    type: Number,
  },
  thang: { 
    type: Number, 
    min: 1, 
    max: 12 
  },
  nam: { 
    type: Number 
  },
  hanThanhToan: { 
    type: Date 
  },
  trangThai: {
    type: String,
    enum: [
      'chua_thanh_toan',  // ← Backend enum
      'da_thanh_toan',    // ← Backend enum
      'qua_han',          // ← Backend enum
      'chua_dong',        // ← Frontend enum (ALIAS)
      'da_dong'           // ← Frontend enum (ALIAS)
    ],
    default: 'chua_thanh_toan'
  },
  ngayDong: { 
    type: Date 
  },
  nguoiThuTien: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  ghiChu: { 
    type: String 
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ← AUTO GENERATE maPhieuThu
phieuThuSchema.pre('save', async function(next) {
  if (!this.maPhieuThu) {
    const count = await mongoose.model('PhieuThu').countDocuments();
    this.maPhieuThu = `PT${String(count + 1).padStart(6, '0')}`;
  }
  
  // ← AUTO SET soPhieuThu
  if (!this.soPhieuThu) {
    this.soPhieuThu = this.maPhieuThu;
  }
  
  // ← AUTO SET tongTien
  if (!this.tongTien) {
    this.tongTien = this.soTien;
  }
  
  // ← NORMALIZE trangThai (ALIAS)
  if (this.trangThai === 'chua_dong') {
    this.trangThai = 'chua_thanh_toan';
  }
  if (this.trangThai === 'da_dong') {
    this.trangThai = 'da_thanh_toan';
  }
  
  next();
});

// ← VIRTUAL: Chuyển đổi trangThai khi trả về frontend
phieuThuSchema.virtual('trangThaiDisplay').get(function() {
  const map = {
    'chua_thanh_toan': 'Chưa đóng',
    'da_thanh_toan': 'Đã đóng',
    'qua_han': 'Quá hạn',
    'chua_dong': 'Chưa đóng',
    'da_dong': 'Đã đóng'
  };
  return map[this.trangThai] || this.trangThai;
});

module.exports = mongoose.model('PhieuThu', phieuThuSchema);