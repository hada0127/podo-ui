# SCSS 디자인 시스템

## 사용법
```scss
@use 'podo-ui/mixin' as *;

.custom {
  padding: s(5);           // 간격
  background: color(primary-base);  // 색상
  border-radius: r(4);     // 반경
}
```

---

## 컬러 시스템

### 테마
```html
<html data-color-mode="light">  <!-- 라이트 -->
<html data-color-mode="dark">   <!-- 다크 -->
<html data-color-mode="">       <!-- 자동 -->
<html data-color-tone="warm">   <!-- 웜 톤 -->
```

### 시맨틱 컬러
- primary, default, default-deep
- info, link, success, warning, danger

### 변형
- base, hover, pressed, focus
- fill, reverse, outline

### CSS 변수
```scss
--color-primary: #7c3aed;
--color-primary-hover: #6d28d9;
--color-bg-block: #ffffff;
--color-bg-modal: #ffffff;
--color-text-body: #212121;
--color-text-sub: #757575;
--color-border: #e0e0e0;
```

---

## 간격 시스템

### 스케일
```
0: 0px    1: 2px     2: 4px     3: 8px     4: 12px
5: 16px   6: 24px    7: 32px    8: 40px    9: 48px
10: 64px  11: 80px   12: 96px   13: 160px
```

### SCSS 함수
```scss
.card {
  padding: s(5);        // 16px
  margin-bottom: s(6);  // 24px
}
```

### 유틸리티 클래스
```html
<div class="p-5 m-b-6">   <!-- padding: 16px, margin-bottom: 24px -->
<div class="p-t-3 m-l-4"> <!-- padding-top: 8px, margin-left: 12px -->
```

---

## 그리드 시스템

### 반응형 컬럼
- PC: 12컬럼
- Tablet: 6컬럼
- Mobile: 4컬럼

### 사용법
```html
<!-- 자동 래핑 -->
<div class="grid">
  <div class="w-4">4컬럼</div>
  <div class="w-8">8컬럼</div>
</div>

<!-- 고정 컬럼 -->
<div class="grid-fix-3">
  <div>1</div>
  <div>2</div>
  <div>3</div>
</div>
```

---

## 타이포그래피

### 폰트
Pretendard (9가지 굵기: 100-900)

### 믹스인
```scss
.title { @include display1; }  // 큰 제목
.body { @include p1; }         // 본문
.caption { @include p5; }      // 캡션
```

### 스타일
- Display: display1 ~ display7
- Paragraph: p1 ~ p5 (semibold 변형 포함)

---

## 반경 (Border Radius)

```scss
border-radius: r(4);  // SCSS 함수
```

```html
<div class="r-2">   <!-- 작은 -->
<div class="r-4">   <!-- 중간 -->
<div class="r-full"> <!-- 원형 -->
```

---

## 아이콘

### HTML
```html
<i class="icon-star"></i>
<i class="icon-heart-fill"></i>
```

### SCSS
```scss
@include icon(star);
```

### 추가 방법
1. `scss/icon/svg/`에 SVG 추가
2. `npm run icon` 실행
3. 생성: `scss/icon/font/icon.woff`
