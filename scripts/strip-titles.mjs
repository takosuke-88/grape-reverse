import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const machinesDir = join(__dirname, '..', 'src', 'data', 'machines');
const files = readdirSync(machinesDir).filter(f => f.endsWith('.ts'));

let count = 0;
files.forEach(file => {
  const filePath = join(machinesDir, file);
  let content = readFileSync(filePath, 'utf8');
  const before = content;
  content = content.replace(/\r?\n  title: "[^"]+",/, '');
  if (content !== before) {
    writeFileSync(filePath, content, 'utf8');
    count++;
    console.log('Stripped: ' + file);
  }
});
console.log('Done. ' + count + ' files updated.');
