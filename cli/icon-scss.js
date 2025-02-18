import path from 'node:path';
import fs from 'node:fs';
import opentype from 'opentype.js';

// 파일 경로와 출력 디렉토리 설정
const woffPath = path.resolve(process.cwd(), 'scss/icon/font/icon.woff');
const outputFileName = path.resolve(process.cwd(), 'scss/icon/icon-name.scss');

// SCSS 파일 생성 함수
function generateIconScss(glyphs, outputPath) {
  let scssContent = '$icon-name: (\n';

  // 각 글리프에 대해 CSS 클래스 생성
  for (const [glyphName, unicode] of Object.entries(glyphs)) {
    if (glyphName === '.notdef') {
      continue;
    }
    scssContent += `  ${glyphName}: ${unicode},\n`;
  }
  scssContent += ');';

  // SCSS 파일 저장
  fs.writeFileSync(outputPath, scssContent, 'utf8');
  console.log(`SCSS file generated at: ${outputPath}`);
}

// WOFF 파일에서 글리프 추출 함수
function extractGlyphsFromWoff(woffPath) {
  const font = opentype.loadSync(woffPath);
  const glyphs = {};

  // GlyphSet 객체에서 글리프를 순회하며 이름과 유니코드 추출
  for (let i = 0; i < font.glyphs.length; i++) {
    const glyph = font.glyphs.get(i);
    if (glyph.unicode) {
      const glyphName = glyph.name || `glyph${i}`;
      const formattedGlyphName = glyphName.replace(/_/g, '-');
      const unicode = `\\${glyph.unicode.toString(16).padStart(4, '0')}`; // 유니코드 값을 \xxxx 형식으로 변환
      glyphs[formattedGlyphName] = unicode;
    }
  }

  return glyphs;
}

// 실행
try {
  if (!fs.existsSync(woffPath)) {
    throw new Error('WOFF file not found.');
  }

  const glyphs = extractGlyphsFromWoff(woffPath);
  generateIconScss(glyphs, outputFileName);
} catch (error) {
  console.error('Error:', error.message);
}
