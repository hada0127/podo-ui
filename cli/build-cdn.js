#!/usr/bin/env node

import { writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import * as sass from 'sass';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Building CSS for CDN...\n');

// 1. Create cdn directory and font subdirectory
const cdnDir = 'cdn';
const fontDir = `${cdnDir}/font`;
if (!existsSync(cdnDir)) {
  mkdirSync(cdnDir, { recursive: true });
}
if (!existsSync(fontDir)) {
  mkdirSync(fontDir, { recursive: true });
}

// 2. Copy icon font
console.log('📦 Copying icon font...');
try {
  copyFileSync('scss/icon/font/icon.woff', `${fontDir}/icon.woff`);
  console.log('✅ icon.woff copied\n');
} catch (error) {
  console.error('❌ Failed to copy icon font:', error.message);
  process.exit(1);
}

// 3. Compile global.scss (expanded)
console.log('📦 Compiling global.scss (expanded)...');
try {
  const expandedResult = sass.compile('global.scss', {
    style: 'expanded',
    loadPaths: ['.', 'scss'],
  });

  const banner = `/*!
 * Podo UI CSS v${process.env.npm_package_version || '0.8.0'}
 * https://podoui.com
 * MIT License
 */\n`;

  writeFileSync(`${cdnDir}/podo-ui.css`, banner + expandedResult.css);
  console.log('✅ podo-ui.css created\n');
} catch (error) {
  console.error('❌ Compilation failed:', error.message);
  process.exit(1);
}

// 4. Compile global.scss (compressed/minified)
console.log('📦 Compiling global.scss (minified)...');
try {
  const compressedResult = sass.compile('global.scss', {
    style: 'compressed',
    loadPaths: ['.', 'scss'],
  });

  const minBanner = `/*! Podo UI CSS v${process.env.npm_package_version || '0.8.0'} | MIT License | https://podoui.com */\n`;

  writeFileSync(`${cdnDir}/podo-ui.min.css`, minBanner + compressedResult.css);
  console.log('✅ podo-ui.min.css created\n');
} catch (error) {
  console.error('❌ Minification failed:', error.message);
  process.exit(1);
}

// 5. Show file sizes
import { statSync } from 'fs';
const cssSize = (statSync(`${cdnDir}/podo-ui.css`).size / 1024).toFixed(2);
const minCssSize = (statSync(`${cdnDir}/podo-ui.min.css`).size / 1024).toFixed(2);
const fontSize = (statSync(`${fontDir}/icon.woff`).size / 1024).toFixed(2);

console.log('📊 File sizes:');
console.log(`   podo-ui.css:     ${cssSize} KB`);
console.log(`   podo-ui.min.css: ${minCssSize} KB`);
console.log(`   font/icon.woff:  ${fontSize} KB\n`);

console.log('🎉 CDN build completed successfully!');
console.log(`\n📁 Output: ${cdnDir}/`);
console.log('   - podo-ui.css (expanded)');
console.log('   - podo-ui.min.css (minified)');
console.log('   - font/icon.woff (icon font)\n');

console.log('💡 Usage:');
console.log('   <link rel="stylesheet" href="https://cdn.example.com/podo-ui.min.css">');
