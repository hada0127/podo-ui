#!/usr/bin/env node

import { execSync } from 'child_process';
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  copyFileSync,
  rmSync,
  existsSync,
} from 'fs';
import { glob } from 'glob';
import { dirname, join } from 'path';

console.log('🚀 Starting Svelte library build...\n');

// 1. Clean
console.log('🧹 Cleaning dist/svelte...');
if (existsSync('dist/svelte')) {
  rmSync('dist/svelte', { recursive: true, force: true });
}
console.log('✅ Clean completed\n');

// 2. Svelte compilation with svelte-package
console.log('📦 Compiling Svelte components...');
try {
  execSync('npx svelte-package -i svelte -o dist/svelte', { stdio: 'inherit' });
  console.log('✅ Svelte compilation completed\n');
} catch (error) {
  console.error('❌ Svelte compilation failed');
  process.exit(1);
}

// 3. Copy SCSS module files if they exist
console.log('📋 Copying SCSS files...');
const scssFiles = glob.sync('svelte/**/*.scss');
let copiedCount = 0;

scssFiles.forEach((file) => {
  const destFile = join('dist', file);
  const destDir = dirname(destFile);

  if (!existsSync(destDir)) {
    mkdirSync(destDir, { recursive: true });
  }

  copyFileSync(file, destFile);
  copiedCount++;
});

console.log(`✅ Copied ${copiedCount} SCSS files\n`);

// 4. Fix SCSS paths in dist folder
console.log('🔧 Fixing SCSS import paths...');
const distScssFiles = glob.sync('dist/svelte/**/*.scss');
let fixedCount = 0;

const pathReplacements = [
  { from: /\.\.\/\.\.\/scss/g, to: '../../../scss' },
  { from: /\.\.\/\.\.\/mixin\.scss/g, to: '../../../mixin.scss' },
  { from: /'\.\.\/\.\.\/mixin'/g, to: "'../../../mixin'" },
  { from: /\.\.\/\.\.\/global\.scss/g, to: '../../../global.scss' },
];

distScssFiles.forEach((file) => {
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

console.log('🎉 Svelte library build completed successfully!');
