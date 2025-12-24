/**
 * 리사이즈 핸들과 wrapper를 제거한 깨끗한 HTML 반환
 * @param html - 원본 HTML 문자열
 * @returns 정리된 HTML 문자열
 */
export const getCleanHTML = (html: string): string => {
  const temp = document.createElement('div');
  temp.innerHTML = html;

  // image-wrapper 제거 (이미지만 남기고)
  const imageWrappers = temp.querySelectorAll('.image-wrapper');
  imageWrappers.forEach(wrapper => {
    const img = wrapper.querySelector('img');
    if (img && wrapper.parentNode) {
      // img를 wrapper 밖으로 이동
      wrapper.parentNode.insertBefore(img, wrapper);
      wrapper.remove();
    }
  });

  // resize-handle 제거
  const resizeHandles = temp.querySelectorAll('.resize-handle');
  resizeHandles.forEach(handle => handle.remove());

  // youtube-wrapper의 resize-handle만 제거 (wrapper는 유지)
  const youtubeWrappers = temp.querySelectorAll('.youtube-wrapper');
  youtubeWrappers.forEach(wrapper => {
    const handles = wrapper.querySelectorAll('.resize-handle');
    handles.forEach(handle => handle.remove());
  });

  return temp.innerHTML;
};

/**
 * HTML 포맷팅 (코드 보기용)
 * @param html - 원본 HTML 문자열
 * @returns 포맷팅된 HTML 문자열
 */
export const formatHtml = (html: string): string => {
  let formatted = '';
  let indentLevel = 0;
  const indentSize = 2;

  // 블록 레벨 요소 정의
  const blockElements = [
    'div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'pre', 'table',
    'thead', 'tbody', 'tr', 'td', 'th', 'section',
    'article', 'header', 'footer', 'nav', 'aside', 'main'
  ];

  // 인라인 요소 정의
  const inlineElements = ['span', 'a', 'strong', 'b', 'em', 'i', 'u', 'code', 'small', 'sub', 'sup', 'mark'];

  // HTML을 토큰으로 분리
  const tokens: string[] = [];
  let current = '';
  let inTag = false;

  for (let i = 0; i < html.length; i++) {
    const char = html[i];

    if (char === '<') {
      if (current.trim()) {
        tokens.push(current);
      }
      current = char;
      inTag = true;
    } else if (char === '>' && inTag) {
      current += char;
      tokens.push(current);
      current = '';
      inTag = false;
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    tokens.push(current);
  }

  // 토큰을 순회하며 포맷팅
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const trimmedToken = token.trim();

    if (!trimmedToken) continue;

    const prevToken = i > 0 ? tokens[i - 1]?.trim() : '';

    // 태그인 경우
    if (trimmedToken.startsWith('<')) {
      // 닫는 태그
      if (trimmedToken.startsWith('</')) {
        const tagName = trimmedToken.match(/<\/(\w+)/)?.[1]?.toLowerCase();

        if (tagName && blockElements.includes(tagName)) {
          indentLevel = Math.max(0, indentLevel - 1);
          formatted += '\n' + ' '.repeat(indentLevel * indentSize) + trimmedToken;
        } else {
          formatted += trimmedToken;
        }
      }
      // 자체 닫는 태그 (self-closing)
      else if (trimmedToken.endsWith('/>')) {
        const tagName = trimmedToken.match(/<(\w+)/)?.[1]?.toLowerCase();

        if (tagName && blockElements.includes(tagName)) {
          formatted += '\n' + ' '.repeat(indentLevel * indentSize) + trimmedToken;
        } else {
          formatted += trimmedToken;
        }
      }
      // 여는 태그
      else {
        const tagName = trimmedToken.match(/<(\w+)/)?.[1]?.toLowerCase();

        // br 태그 특별 처리: 줄바꿈 후 다음 요소는 현재 레벨 유지
        if (tagName === 'br') {
          formatted += trimmedToken;
        } else if (tagName && blockElements.includes(tagName)) {
          formatted += '\n' + ' '.repeat(indentLevel * indentSize) + trimmedToken;

          // 여는 태그와 닫는 태그가 같은 줄에 있지 않으면 들여쓰기 증가
          const nextToken = tokens[i + 1];
          const closingTag = `</${tagName}>`;
          if (!nextToken || !nextToken.includes(closingTag)) {
            indentLevel++;
          }
        } else {
          // 인라인 요소
          // br 태그 직후인 경우 줄바꿈과 들여쓰기 추가
          if (prevToken === '<br>' || prevToken === '<br/>') {
            formatted += '\n' + ' '.repeat(indentLevel * indentSize) + trimmedToken;
          } else {
            formatted += trimmedToken;
          }
        }
      }
    }
    // 텍스트 노드
    else {
      const nextToken = tokens[i + 1];

      // br 태그 직후인 경우, 이미 줄바꿈과 들여쓰기가 추가되어 있음
      if (prevToken === '<br>' || prevToken === '<br/>') {
        formatted += trimmedToken;
      }
      // 이전이나 다음 토큰이 인라인 요소면 공백 없이 추가
      else if (prevToken && inlineElements.some(tag => prevToken.includes(`<${tag}`)) ||
          nextToken && inlineElements.some(tag => nextToken.includes(`</${tag}`))) {
        formatted += trimmedToken;
      } else {
        formatted += trimmedToken;
      }
    }
  }

  // 앞뒤 공백 제거 및 연속된 빈 줄 정리
  return formatted.trim().replace(/\n\s*\n\s*\n/g, '\n\n');
};
