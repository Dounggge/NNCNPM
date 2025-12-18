const mongoose = require('mongoose');
require('dotenv').config();

async function fixEmail() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quanlydancu');
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const users = db.collection('users');

    // 1. Xem indexes hiện tại
    console.log('📋 Current indexes:');
    const indexes = await users.indexes();
    indexes.forEach(idx => {
      console.log(`  - ${idx.name}:`, idx.key, idx.sparse ? '(sparse)' : '');
    });

    // 2. Drop index email_1
    try {
      await users.dropIndex('email_1');
      console.log('\n✅ Dropped email_1 index');
    } catch (err) {
      console.log('\n⚠️ Index email_1 not found');
    }

    // 3. Đếm users với email null
    const nullEmailCount = await users.countDocuments({ email: null });
    console.log(`\n📊 Users with email=null: ${nullEmailCount}`);

    // 4. Update tất cả email null thành undefined (để sparse index hoạt động)
    const updateResult = await users.updateMany(
      { email: null },
      { $unset: { email: '' } }
    );
    console.log(`✅ Removed email field from ${updateResult.modifiedCount} users`);

    // 5. Tạo lại index với sparse
    await users.createIndex(
      { email: 1 },
      { 
        unique: true, 
        sparse: true,
        name: 'email_1'
      }
    );
    console.log('✅ Created new email_1 index (sparse)');

    // 6. Xem lại indexes
    console.log('\n📋 Final indexes:');
    const finalIndexes = await users.indexes();
    finalIndexes.forEach(idx => {
      console.log(`  - ${idx.name}:`, idx.key, idx.sparse ? '(sparse)' : '');
    });

    // 7. List all users
    console.log('\n👥 Current users:');
    const allUsers = await users.find({}, { projection: { userName: 1, hoTen: 1, vaiTro: 1, email: 1 } }).toArray();
    allUsers.forEach((user, i) => {
      console.log(`  ${i + 1}. ${user.hoTen} (@${user.userName}) - ${user.vaiTro} - email: ${user.email || 'none'}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Done! Restart backend now.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

fixEmail();