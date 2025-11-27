#!/usr/bin/env node

import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Building JS for CDN...\n');

// 1. Create cdn directory
const cdnDir = 'cdn';
if (!existsSync(cdnDir)) {
  mkdirSync(cdnDir, { recursive: true });
}

// 2. Read vanilla datepicker JS
console.log('📦 Processing vanilla/datepicker.js...');
const version = process.env.npm_package_version || '0.8.0';

try {
  // Read source file
  let jsContent = readFileSync('vanilla/datepicker.js', 'utf8');

  // Add banner
  const banner = `/*!
 * Podo UI DatePicker v${version}
 * https://podoui.com
 * MIT License
 */
`;

  // Write expanded version
  writeFileSync(`${cdnDir}/podo-datepicker.js`, banner + jsContent);
  console.log('✅ podo-datepicker.js created\n');

  // Create minified version (simple minification)
  console.log('📦 Creating minified version...');
  const minifiedContent = minifyJS(jsContent);
  const minBanner = `/*! Podo UI DatePicker v${version} | MIT License | https://podoui.com */\n`;
  writeFileSync(`${cdnDir}/podo-datepicker.min.js`, minBanner + minifiedContent);
  console.log('✅ podo-datepicker.min.js created\n');
} catch (error) {
  console.error('❌ JS build failed:', error.message);
  process.exit(1);
}

// 3. Copy CSS
console.log('📦 Copying vanilla/datepicker.css...');
try {
  let cssContent = readFileSync('vanilla/datepicker.css', 'utf8');

  const cssBanner = `/*!
 * Podo UI DatePicker CSS v${version}
 * https://podoui.com
 * MIT License
 */
`;

  writeFileSync(`${cdnDir}/podo-datepicker.css`, cssBanner + cssContent);
  console.log('✅ podo-datepicker.css created\n');

  // Minify CSS
  console.log('📦 Creating minified CSS...');
  const minifiedCSS = minifyCSS(cssContent);
  const cssMinBanner = `/*! Podo UI DatePicker CSS v${version} | MIT License | https://podoui.com */\n`;
  writeFileSync(`${cdnDir}/podo-datepicker.min.css`, cssMinBanner + minifiedCSS);
  console.log('✅ podo-datepicker.min.css created\n');
} catch (error) {
  console.error('❌ CSS copy failed:', error.message);
  process.exit(1);
}

// 4. Show file sizes
const jsSize = (statSync(`${cdnDir}/podo-datepicker.js`).size / 1024).toFixed(2);
const minJsSize = (statSync(`${cdnDir}/podo-datepicker.min.js`).size / 1024).toFixed(2);
const cssSize = (statSync(`${cdnDir}/podo-datepicker.css`).size / 1024).toFixed(2);
const minCssSize = (statSync(`${cdnDir}/podo-datepicker.min.css`).size / 1024).toFixed(2);

console.log('📊 File sizes:');
console.log(`   podo-datepicker.js:      ${jsSize} KB`);
console.log(`   podo-datepicker.min.js:  ${minJsSize} KB`);
console.log(`   podo-datepicker.css:     ${cssSize} KB`);
console.log(`   podo-datepicker.min.css: ${minCssSize} KB\n`);

console.log('🎉 CDN JS build completed successfully!');
console.log(`\n📁 Output: ${cdnDir}/`);
console.log('   - podo-datepicker.js (expanded)');
console.log('   - podo-datepicker.min.js (minified)');
console.log('   - podo-datepicker.css (expanded)');
console.log('   - podo-datepicker.min.css (minified)\n');

console.log('💡 Usage:');
console.log('   <link rel="stylesheet" href="https://cdn.example.com/podo-datepicker.min.css">');
console.log('   <script src="https://cdn.example.com/podo-datepicker.min.js"></script>');
console.log('   <script>');
console.log('     const picker = new PodoDatePicker(document.getElementById("my-picker"), {');
console.log('       mode: "instant",');
console.log('       type: "date"');
console.log('     });');
console.log('   </script>');

// Simple JS minifier (removes comments and unnecessary whitespace)
function minifyJS(code) {
  // Remove multi-line comments
  code = code.replace(/\/\*[\s\S]*?\*\//g, '');
  // Remove single-line comments (but not in strings)
  code = code.replace(/(?<!:)\/\/.*$/gm, '');
  // Remove leading/trailing whitespace from lines
  code = code.replace(/^\s+/gm, '');
  code = code.replace(/\s+$/gm, '');
  // Reduce multiple spaces to single space
  code = code.replace(/\s{2,}/g, ' ');
  // Remove newlines
  code = code.replace(/\n+/g, '');
  // Add back some newlines for readability in min version
  code = code.replace(/;}/g, ';}');
  return code;
}

// Simple CSS minifier
function minifyCSS(code) {
  // Remove comments
  code = code.replace(/\/\*[\s\S]*?\*\//g, '');
  // Remove whitespace around special characters
  code = code.replace(/\s*([{}:;,>~+])\s*/g, '$1');
  // Remove leading/trailing whitespace
  code = code.replace(/^\s+/gm, '');
  code = code.replace(/\s+$/gm, '');
  // Remove multiple spaces
  code = code.replace(/\s{2,}/g, ' ');
  // Remove newlines
  code = code.replace(/\n+/g, '');
  return code;
}
