const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

function fixEol(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (!content.endsWith('\n')) {
      fs.writeFileSync(filePath, content + '\n');
      console.log(`Fixed EOL: ${path.relative(projectRoot, filePath)}`);
    }
  } catch (error) {
    console.error(`Error fixing EOL for ${filePath}:`, error);
  }
}

function traverseDirectory(dir) {
  fs.readdirSync(dir).forEach(file => {
    if (file === 'node_modules') return;
    
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      traverseDirectory(fullPath);
    } else if (
      /\.(js|jsx|css|scss|json|html)$/.test(fullPath)
    ) {
      fixEol(fullPath);
    }
  });
}

console.log('Fixing end-of-line issues...');
traverseDirectory(path.join(projectRoot, 'src'));
console.log('✅ All files fixed (eol-last)');