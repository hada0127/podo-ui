# 아이콘 가이드

## 아이콘 추가 방법

### 1. SVG 파일 준비
- 위치: `scss/icon/svg/`
- 형식: `.svg`
- 네이밍: kebab-case (예: `arrow-left.svg`)

### 2. SVG 최적화
```xml
<!-- 권장 형식 -->
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="..." fill="currentColor"/>
</svg>
```

**주의사항:**
- `fill="currentColor"` 사용 (CSS로 색상 제어)
- 고정 width/height 제거
- viewBox 유지

### 3. 폰트 빌드
```bash
npm run icon
```

### 4. 생성 파일
| 파일 | 경로 |
|------|------|
| 폰트 | `scss/icon/font/icon.woff` |
| 맵 | `scss/icon/icon-name.scss` |

---

## 사용법

### HTML 클래스
```html
<i class="icon-star"></i>
<i class="icon-heart-fill"></i>
<i class="icon-arrow-left"></i>
```

### SCSS Mixin
```scss
@use 'podo-ui/mixin' as *;

.button::before {
  @include icon(star);
}
```

### 크기 조절
```html
<!-- 클래스로 -->
<i class="icon-star icon-lg"></i>

<!-- 인라인으로 -->
<i class="icon-star" style="font-size: 24px;"></i>
```

### 색상 변경
```scss
.icon-custom {
  color: var(--color-primary);
}
```

---

## 아이콘 네이밍 규칙

| 패턴 | 의미 | 예시 |
|------|------|------|
| `{name}` | 기본 (outline) | `star`, `heart` |
| `{name}-fill` | 채움 | `star-fill`, `heart-fill` |
| `{name}-outline` | 명시적 outline | `check-outline` |
| `arrow-{direction}` | 방향 | `arrow-left`, `arrow-up` |
| `chevron-{direction}` | 꺾쇠 | `chevron-down` |

---

## 아이콘 맵 구조

빌드 후 생성되는 `icon-name.scss`:
```scss
$icon-name: (
  star: \e900,
  star-fill: \e901,
  heart: \e902,
  heart-fill: \e903,
  // ...
);
```

---

## 트러블슈팅

### 아이콘이 표시되지 않음
1. `npm run icon` 실행 확인
2. `icon.woff` 파일 존재 확인
3. CSS에서 font-face 로드 확인

### 아이콘 깨짐
1. SVG viewBox 확인
2. path 데이터 유효성 확인
3. fill="currentColor" 확인

### CDN에서 아이콘 없음
1. `npm run build:cdn` 재실행
2. `cdn/` 폴더에 폰트 포함 확인

---

## 현재 아이콘 목록 확인

```bash
# 아이콘 이름 목록
cat scss/icon/icon-name.scss
```

또는 문서 사이트: `/foundation/icons`
