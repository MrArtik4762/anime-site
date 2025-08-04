const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

function fixEol(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (!content.endsWith('\n')) {
    fs.writeFileSync(filePath, content + '\n');
  }
}

function traverseDirectory(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseDirectory(fullPath);
    } else if (
      fullPath.endsWith('.js') || 
      fullPath.endsWith('.jsx') ||
      fullPath.endsWith('.css') ||
      fullPath.endsWith('.json')
    ) {
      fixEol(fullPath);
    }
  });
}

traverseDirectory(projectRoot);
console.log('✅ Все файлы исправлены (eol-last)');