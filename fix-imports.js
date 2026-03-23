const fs = require('fs');
const path = require('path');

const srcDir = path.join(process.cwd(), 'src', 'app');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(srcDir);
let changedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Using a more robust regex that ignores shared/models already 
    const regex = /from\s+['"](?:\.\.?\/)+models\/([^'"]+)['"]/g;
    
    if (!file.replace(/\\/g, '/').includes('/shared/models')) {
        let hasChanges = false;
        let newContent = content.replace(regex, (match, p1) => {
            hasChanges = true;
            return `from '@shared/models/${p1}'`;
        });
        
        if (hasChanges && newContent !== original) {
            fs.writeFileSync(file, newContent, 'utf8');
            changedCount++;
            console.log(`Updated: ${file}`);
        }
    }
});

console.log(`\nFixed ${changedCount} files.`);
