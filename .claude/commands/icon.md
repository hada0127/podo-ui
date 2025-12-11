# 아이콘 관리

---

## 아이콘 추가 방법
1. `scss/icon/svg/`에 SVG 파일 추가
2. `npm run icon` 실행
3. 생성 파일: `scss/icon/font/icon.woff`

## 사용법
```html
<i class="icon-{name}"></i>
```

```scss
@include icon({name});
```

## 현재 작업
`npm run icon` 실행하고 결과를 확인해주세요.
