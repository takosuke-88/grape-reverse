const fs = require('fs');
const path = require('path');

const machinesDir = path.join(__dirname, '..', 'src', 'data', 'machines');
const files = fs.readdirSync(machinesDir).filter(f => f.endsWith('.ts'));

let count = 0;
files.forEach(file => {
  const filePath = path.join(machinesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const before = content;
  // Remove standalone "  title: '...'," line (top-level config title only)
  content = content.replace(/\r?\n  title: "[^"]+",/, '');
  if (content !== before) {
    fs.writeFileSync(filePath, content, 'utf8');
    count++;
    console.log('Stripped: ' + file);
  }
});
console.log('Done. ' + count + ' files updated.');
