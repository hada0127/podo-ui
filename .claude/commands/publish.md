# NPM 배포

---

## 배포 전 체크리스트
1. [ ] 모든 변경사항 커밋됨
2. [ ] 버전 업데이트 (`package.json`)
3. [ ] `npm run build:all` 성공

## 배포 명령어
```bash
npm version patch  # 또는 minor, major
npm publish
```

## 자동 실행
`prepublishOnly` 스크립트로 `npm run build:all` 자동 실행

## 주의사항
- icon.woff 포함 확인
- dist/ 폴더 생성 확인
- cdn/ 폴더 최신 상태 확인
