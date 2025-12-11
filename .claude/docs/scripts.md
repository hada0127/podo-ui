# NPM 스크립트

## 개발
```bash
npm run dev          # Vite 개발 서버
npm run preview      # 빌드 결과 미리보기
```

## 문서 사이트 빌드
```bash
npm run build        # Vite 빌드 + Vike prerender (정적 사이트 생성)
npm run deploy       # Cloudflare Pages 배포 (빌드 후 dist/client 배포)
```

## 라이브러리 빌드
```bash
npm run build:lib    # React 라이브러리 빌드 → dist/
npm run build:cdn    # CDN용 CSS 빌드 → cdn/podo-ui.css
npm run build:cdn-js # Vanilla JS 빌드 → cdn/podo-datepicker.js
npm run build:all    # 전체 빌드 (위 3개 모두)
```

## 아이콘
```bash
npm run icon         # SVG → WOFF 폰트 생성
```

## 배포
```bash
npm publish          # npm 배포 (자동으로 build:all 실행)
```

## 코드 품질
```bash
npm run lint         # ESLint 실행
```

## 주의사항
- `npm publish` 전 `npm run build:all` 자동 실행 (prepublishOnly)
- 아이콘 추가 시 `npm run icon` 필수
- CDN 배포 시 icon.woff 포함 확인
- 문서 사이트 빌드 시 `vike prerender`로 정적 HTML 생성
