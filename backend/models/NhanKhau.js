const mongoose = require('mongoose');

const NhanKhauSchema = new mongoose.Schema({
  canCuocCongDan: { 
    type: String, 
    required: [true, 'CCCD là bắt buộc'],
    unique: true,
    validate: {
      validator: function(v) {
        return /^[0-9]{9,12}$/.test(v);
      },
      message: 'CCCD phải là 9-12 chữ số'
    }
  },
  hoTen: { 
    type: String, 
    required: [true, 'Họ tên là bắt buộc']
  },
  ngaySinh: { 
    type: Date,
    required: [true, 'Ngày sinh là bắt buộc']
  },
  gioiTinh: { 
    type: String, 
    enum: ['Nam', 'Nu', 'Khac'],
    required: [true, 'Giới tính là bắt buộc']
  },
  queQuan: { 
    type: String,
    required: [true, 'Quê quán là bắt buộc']
  },
  danToc: { 
    type: String,
    required: [true, 'Dân tộc là bắt buộc']
  },
  ngheNghiep: { 
    type: String,
    required: [true, 'Nghề nghiệp là bắt buộc']
  },
  quocTich: { type: String, default: 'Việt Nam' },
  noiSinh: String,
  diaChiThuongTru: String,
  diaChiHienTai: String,
  soDienThoai: String,
  email: String,
  noiLamViec: String,
  trinhDoHocVan: String,
  tonGiao: String,
  hoKhauId: { type: mongoose.Schema.Types.ObjectId, ref: 'HoKhau' },
  quanHeVoiChuHo: {
    type: String,
    enum: ['Chủ hộ', 'Vợ/Chồng', 'Con', 'Bố/Mẹ', 'Anh/Chị/Em', 'Ông/Bà', 'Khác']
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  trangThai: {
    type: String,
    enum: ['active', 'moved', 'deceased'],
    default: 'active'
  },
  ghiChu: String
}, {
  timestamps: true
});

module.exports = mongoose.model('NhanKhau', NhanKhauSchema);