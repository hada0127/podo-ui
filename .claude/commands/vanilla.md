# Vanilla JS 컴포넌트

작업: $ARGUMENTS

---

## 파일 구조
```
vanilla/{component}.js     # ES 모듈 소스
vanilla/{component}.css    # 스타일
cdn/podo-{component}.js    # UMD 빌드
cdn/podo-{component}.min.js
cdn/podo-{component}.css
```

## 빌드
```bash
npm run build:cdn-js
```

## CSS 변수 규칙
podo-ui.css 변수 상속 + 폴백 필수:
```css
var(--color-primary, #7c3aed)
```

요청에 따라 작업을 진행해주세요.
