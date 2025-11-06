#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, existsSync } from 'fs';
import { glob } from 'glob';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting library build...\n');

// 1. Clean
console.log('🧹 Cleaning dist and build cache...');
if (existsSync('dist')) {
  rmSync('dist', { recursive: true, force: true });
}
if (existsSync('.tsbuildinfo')) {
  rmSync('.tsbuildinfo');
}
console.log('✅ Clean completed\n');

// 2. TypeScript compilation
console.log('📦 Compiling TypeScript...');
try {
  execSync('tsc -p tsconfig.build.json', { stdio: 'inherit' });
  console.log('✅ TypeScript compilation completed\n');
} catch (error) {
  console.error('❌ TypeScript compilation failed');
  process.exit(1);
}

// 3. Copy SCSS files
console.log('📋 Copying SCSS files...');
const scssFiles = glob.sync('react/**/*.scss');
let copiedCount = 0;

scssFiles.forEach(file => {
  const destFile = join('dist', file);
  const destDir = dirname(destFile);

  if (!existsSync(destDir)) {
    mkdirSync(destDir, { recursive: true });
  }

  copyFileSync(file, destFile);
  copiedCount++;
});

console.log(`✅ Copied ${copiedCount} SCSS files\n`);

// 4. Fix SCSS paths
console.log('🔧 Fixing SCSS import paths...');
const distScssFiles = glob.sync('dist/react/**/*.scss');
let fixedCount = 0;

const pathReplacements = [
  { from: /\.\.\/\.\.\/scss/g, to: '../../../scss' },
  { from: /\.\.\/\.\.\/mixin\.scss/g, to: '../../../mixin.scss' },
  { from: /'\.\.\/\.\.\/mixin'/g, to: "'../../../mixin'" },
  { from: /\.\.\/\.\.\/global\.scss/g, to: '../../../global.scss' },
];

distScssFiles.forEach(file => {
  let content = readFileSync(file, 'utf8');
  let modified = false;

  pathReplacements.forEach(({ from, to }) => {
    if (from.test(content)) {
      content = content.replace(from, to);
      modified = true;
    }
  });

  if (modified) {
    writeFileSync(file, content, 'utf8');
    fixedCount++;
  }
});

console.log(`✅ Fixed paths in ${fixedCount} SCSS files\n`);

console.log('🎉 Library build completed successfully!');
