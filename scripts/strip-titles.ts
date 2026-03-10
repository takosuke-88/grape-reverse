import fs from 'fs';
import path from 'path';

const machinesDir = path.join(__dirname, '..', 'src', 'data', 'machines');
const files = fs.readdirSync(machinesDir).filter(f => f.endsWith('.ts'));

files.forEach(file => {
  const filePath = path.join(machinesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/[\r\n]+  title: \"[^\"]+\",/, '');
  fs.writeFileSync(filePath, content, 'utf8');
});
console.log('Stripped titles from ' + files.length + ' machine configs.');
