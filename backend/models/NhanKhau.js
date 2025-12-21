const mongoose = require('mongoose');

const nhanKhauSchema = new mongoose.Schema({
  hoTen: {
    type: String,
    required: true
  },
  canCuocCongDan: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^[0-9]{12}$/.test(v);
      },
      message: 'CCCD phải là 12 chữ số'
    }
  },
  ngaySinh: {
    type: Date,
    required: true
  },
  gioiTinh: {
    type: String,
    enum: ['Nam', 'Nữ', 'Nu', 'Khác'],
    required: true
  },
  noiSinh: String,
  queQuan: {
    type: String,
    required: true
  },
  danToc: {
    type: String,
    required: true
  },
  tonGiao: String,
  ngheNghiep: {
    type: String,
    required: true
  },
  noiLamViec: String,
  trinhDoHocVan: String,
  soDienThoai: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^[0-9]{10}$/.test(v);
      },
      message: 'Số điện thoại phải là 10 chữ số'
    }
  },
  email: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Email không hợp lệ'
    }
  },
  hoKhauId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HoKhau'
  },
  // ← THÊM FIELD NÀY
  quanHeVoiChuHo: {
    type: String,
    enum: ['Chủ hộ', 'Vợ', 'Chồng', 'Con', 'Cha', 'Mẹ', 'Anh', 'Chị', 'Em', 'Ông', 'Bà', 'Cháu', 'Khác']
  },
  quocTich: {
    type: String,
    default: 'Việt Nam'
  },
  trangThai: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('NhanKhau', nhanKhauSchema);