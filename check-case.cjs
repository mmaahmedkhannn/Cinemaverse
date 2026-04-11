const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      file = path.join(dir, file);
      const stat = fs.statSync(file);
      if (stat && stat.isDirectory()) {
        results = results.concat(walk(file));
      } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
        results.push(file);
      }
    });
  } catch (err) {}
  return results;
}

const srcFiles = walk(path.join(process.cwd(), 'src'));
const allFilesList = walk(process.cwd()).map(f => f.replace(/\\/g, '/'));
let hasError = false;

srcFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  // Match full import statements like: import { X } from './path' or import './path'
  const importRegex = /(?:import|from)\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    let importPath = match[1];
    
    // Only check local relative paths
    if (importPath.startsWith('.')) {
      const resolvedPath = path.resolve(path.dirname(file), importPath).replace(/\\/g, '/');
      
      let found = false;
      const exts = ['', '.ts', '.tsx', '.js', '/index.ts', '/index.tsx', '.css', '.svg', '.json'];
      
      for (const ext of exts) {
        // Strip everything up to the project root for comparison
        const relativeResolvedPath = '.' + resolvedPath.substring(process.cwd().replace(/\\/g, '/').length);
        
        // Exact match
        if (allFilesList.includes(relativeResolvedPath + ext)) {
          found = true;
          break;
        } 
        // Case-insensitive match but EXACT miss
        else if (allFilesList.some(f => f.toLowerCase() === (relativeResolvedPath + ext).toLowerCase())) {
          console.log('\n!!! CASE SENSITIVITY ERROR !!!');
          console.log('File:', file);
          console.log('Import String:', importPath);
          console.log('Resolved Path:', relativeResolvedPath + ext);
          const actualPath = allFilesList.find(f => f.toLowerCase() === (relativeResolvedPath + ext).toLowerCase());
          console.log('Actual file system path:', actualPath);
          hasError = true;
          found = true; // Mark as found to avoid the "missing completely" log
          break;
        }
      }
    }
  }
});

if (!hasError) {
  console.log('No case sensitivity errors found.');
}
