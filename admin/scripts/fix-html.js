const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const bodyStart = html.indexOf('<body class="bg-slate-100 text-slate-800">');
const contentStart = html.indexOf('<div class="sidebar-backdrop"');

if (bodyStart === -1 || contentStart === -1) {
  throw new Error('Could not locate body markers');
}

const head = html.slice(0, bodyStart);
const content = html.slice(contentStart);

const fixed = `${head}<body class="bg-slate-100 text-slate-800">\n    ${content}`;
fs.writeFileSync(htmlPath, fixed);
console.log('Fixed index.html');
