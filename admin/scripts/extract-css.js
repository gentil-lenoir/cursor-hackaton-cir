const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'index.html');
const outPath = path.join(__dirname, '..', 'src', 'input.css');
const html = fs.readFileSync(htmlPath, 'utf8');
const match = html.match(/<style>([\s\S]*?)<\/style>/);

if (!match) {
  throw new Error('No <style> block found in index.html');
}

let css = match[1].replace(/^\s*:root\s*\{[\s\S]*?\}\s*/m, '');

const output = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --sidebar-width: 220px;
  }

  body {
    @apply font-sans antialiased;
  }
}

@layer components {
${css}
}
`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, output);
console.log('Wrote', outPath);
