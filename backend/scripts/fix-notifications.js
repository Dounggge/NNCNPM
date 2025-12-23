const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, '..', 'routes');

// Đọc tất cả file trong thư mục routes
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));

files.forEach(file => {
  const filePath = path.join(routesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Regex tìm pattern createNotification({...})
  const regex = /createNotification\(\s*\{([^}]+)\}\s*\)/g;
  
  let match;
  while ((match = regex.exec(content)) !== null) {
    console.log(`Found in ${file}:`, match[0]);
  }
});

console.log('\n✅ Scan complete! Please review and fix manually.');