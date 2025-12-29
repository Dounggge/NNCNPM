const mongoose = require('mongoose');
require('dotenv').config();

async function setAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quanlydancu');
    console.log('✅ Connected to MongoDB');

    const User = require('../models/User');

    // Lấy username từ argument
    const userName = process.argv[2];
    const role = process.argv[3] || 'admin';

    if (!userName) {
      console.log('❌ Usage: node scripts/set-admin.js <userName> [role]');
      console.log('   Roles: admin, to_truong, ke_toan, chu_ho, dan_cu');
      console.log('   Example: node scripts/set-admin.js GianDung admin');
      process.exit(1);
    }

    const user = await User.findOne({ userName });
    if (!user) {
      console.log(`❌ User "${userName}" không tồn tại`);
      process.exit(1);
    }

    const validRoles = ['admin', 'to_truong', 'ke_toan', 'chu_ho', 'dan_cu'];
    if (!validRoles.includes(role)) {
      console.log(`❌ Role "${role}" không hợp lệ`);
      console.log('   Valid roles:', validRoles.join(', '));
      process.exit(1);
    }

    user.vaiTro = role;
    await user.save();

    console.log(`✅ Đã set user "${userName}" thành "${role}"`);
    console.log(`   - ID: ${user._id}`);
    console.log(`   - Họ tên: ${user.hoTen}`);
    console.log(`   - Vai trò mới: ${user.vaiTro}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setAdmin();