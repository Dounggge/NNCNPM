const mongoose = require('mongoose');

const NhanKhauSchema = new mongoose.Schema({
  canCuocCongDan: { 
    type: String, 
    required: true, 
    unique: true,
    length: 12 
  },
  hoTen: { 
    type: String, 
    required: true 
  },
  ngaySinh: { 
    type: Date,
  },
  gioiTinh: { 
    type: String, 
    enum: ['Nam', 'Nu', 'Khac'],
  },
  danToc: { 
    type: String,
    default: 'Kinh'
  },
  quocTich: {
    type: String,
    default: 'Việt Nam'
  },
  queQuan: String,
  diaChiThuongTru: String,
  diaChiHienTai: String,
  soDienThoai: String,
  email: String,
  ngheNghiep: String,
  noiLamViec: String,
  trinhDoHocVan: String,
  tonGiao: String,
  
  // Thông tin hộ khẩu
  hoKhauId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HoKhau'
  },
  quanHeVoiChuHo: {
    type: String,
    enum: ['Chủ hộ', 'Vợ/Chồng', 'Con', 'Bố/Mẹ', 'Anh/Chị/Em', 'Ông/Bà', 'Khác']
  },
  
  // User account (if registered)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  trangThai: {
    type: String,
    enum: ['active', 'moved', 'deceased'],
    default: 'active'
  },
  
  ghiChu: String,
  
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('NhanKhau', NhanKhauSchema);