const mongoose = require('mongoose');

const DonXinVaoHoSchema = new mongoose.Schema({
  hoKhauId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HoKhau',
    required: true
  },
  chuHoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NhanKhau',
    required: true
  },
  // Thông tin người xin vào hộ
  thongTinNguoiXin: {
    hoTen: { type: String, required: true },
    canCuocCongDan: { type: String, required: true },
    ngaySinh: { type: Date, required: true },
    gioiTinh: { type: String, enum: ['Nam', 'Nữ', 'Khác'], required: true },
    queQuan: { type: String, required: true },
    danToc: { type: String, required: true },
    tonGiao: String,
    ngheNghiep: { type: String, required: true },
    noiLamViec: String,
    soDienThoai: String
  },
  quanHeVoiChuHo: {
    type: String,
    required: true,
    enum: ['Vợ', 'Chồng', 'Con', 'Cha', 'Mẹ', 'Anh', 'Chị', 'Em', 'Ông', 'Bà', 'Cháu', 'Khác']
  },
  lyDo: {
    type: String,
    required: true
  },
  trangThai: {
    type: String,
    enum: ['cho_duyet', 'da_duyet', 'tu_choi'],
    default: 'cho_duyet'
  },
  nguoiDuyet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  ngayDuyet: Date,
  ghiChuDuyet: String,
  // Tự động tạo nhanKhauId nếu CCCD đã tồn tại
  nhanKhauId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NhanKhau'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DonXinVaoHo', DonXinVaoHoSchema);