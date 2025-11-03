const mongoose = require('mongoose');

const NhanKhauSchema = new mongoose.Schema({
  hoTen: { type: String, required: true },
  ngaySinh: { type: Date, required: true },
  gioiTinh: { type: String, enum: ['Nam', 'Nu', 'Khac'], required: true },
  danToc: { type : String, required : true },
  cmnd: { type: String, unique: true, sparse: true },
  quanHeChuHo: String,
  ngheNghiep: String,
  trinhDo: String,
  tonGiao: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('NhanKhau', NhanKhauSchema);