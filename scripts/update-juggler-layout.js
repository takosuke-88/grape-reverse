const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '../src/data/machines');
const files = fs.readdirSync(dir).filter(f => f.includes('juggler') && f.endsWith('.ts'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add layout: 'grid' to bonus-breakdown-section
  content = content.replace(/id: "bonus-breakdown-section",\s*title: "ボーナス詳細内訳",/g, 
    'id: "bonus-breakdown-section",\n      title: "ボーナス詳細内訳",\n      layout: "grid",');
  
  // Add colSpan: 2 to big-unknown-count
  content = content.replace(/(id: "big-unknown-count"[\s\S]*?visibility: "detail",)/g, '$1\n          colSpan: 2,');
  
  // Add colSpan: 2 to reg-unknown-count
  content = content.replace(/(id: "reg-unknown-count"[\s\S]*?visibility: "detail",)/g, '$1\n          colSpan: 2,');

  fs.writeFileSync(filePath, content);
  console.log('Updated ' + file);
});
