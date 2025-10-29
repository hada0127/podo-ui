# Podo-UI 사용 가이드

> SCSS Module 기반 디자인 시스템
> 설명서 : https://podoui.com
> 저장소: https://github.com/hada0127/podo-ui

---

## 목차
1. [설치 및 기본 설정](#설치-및-기본-설정)
2. [컴포넌트](#컴포넌트)
3. [색상 시스템](#색상-시스템)
4. [레이아웃](#레이아웃)
5. [그리드 시스템](#그리드-시스템)
6. [타이포그래피](#타이포그래피)

---

## 설치 및 기본 설정

### 1. Global SCSS 적용

```typescript
// main.tsx
import 'podo-ui/global.scss';
```

### 2. SCSS Module에서 변수/함수/믹스인 사용

```scss
// component.module.scss
@use 'podo-ui/mixin' as *;

.myComponent {
  color: color(primary);
  margin: s(4);
  border-radius: r(2);
}
```

### 3. Vite 프로젝트 설정 (필수)

⚠️ **Vite를 사용하는 경우 폰트 경로 재정의가 필요합니다!**

Vite에서는 node_modules 내의 상대 경로를 올바르게 처리하지 못할 수 있습니다. `podo-ui/vite-fonts.scss`를 추가로 import하세요:

```typescript
// main.tsx
import 'podo-ui/global.scss';
import 'podo-ui/vite-fonts.scss'; // Vite용 폰트 경로 재정의
```

이 파일은 아이콘 폰트와 Pretendard 폰트의 경로를 Vite에서 올바르게 로드되도록 재정의합니다.

**Next.js나 CRA 등 다른 번들러는 `vite-fonts.scss` 없이 사용 가능합니다.**

---

## 컴포넌트

### React 컴포넌트

⚠️ **중요: React 컴포넌트는 `podo-ui/react`에서 import해야 합니다!**

podo-ui는 주로 CSS 클래스 기반이지만, 몇 가지 React 컴포넌트를 제공합니다:

#### Input

```tsx
import { Input } from 'podo-ui/react';  // ⚠️ 'podo-ui/react' 경로 사용!

<Input
  type="text"
  placeholder="입력하세요"
  value={value}
  onChange={handleChange}
  validator={zodSchema}  // Zod 스키마로 유효성 검사
  withIcon="icon-search"  // 왼쪽 아이콘
  withRightIcon="icon-clear"  // 오른쪽 아이콘
  unit="원"  // 단위 표시
/>
```

**Props:**
- `value`: string | number
- `validator`: Zod 스키마 (선택)
- `withIcon`: 왼쪽 아이콘 클래스명
- `withRightIcon`: 오른쪽 아이콘 클래스명
- `unit`: 단위 문자열
- 기타 HTML input 속성 전부 지원

#### Textarea

```tsx
import { Textarea } from 'podo-ui/react';  // ⚠️ 'podo-ui/react' 경로 사용!

<Textarea
  placeholder="내용을 입력하세요"
  value={value}
  onChange={handleChange}
  rows={5}
/>
```

#### Editor (WYSIWYG)

```tsx
import { Editor } from 'podo-ui/react';  // ⚠️ 'podo-ui/react' 경로 사용!

<Editor
  value={content}
  onChange={handleChange}
/>
```

#### Field (Form 그룹)

```tsx
import { Field, Input } from 'podo-ui/react';  // ⚠️ 'podo-ui/react' 경로 사용!

<Field
  label="이름"
  required
  error="이름을 입력해주세요"
>
  <Input type="text" />
</Field>
```

---

## 색상 시스템

### 사용 가능한 색상 타입

- `primary` - 주요 색상
- `default` - 기본 색상
- `default-deep` - 진한 기본 색상
- `info` - 정보 색상
- `link` - 링크 색상
- `success` - 성공 색상
- `warning` - 경고 색상
- `danger` - 위험 색상

### 색상 변형

각 색상은 다음 변형을 가집니다:
- `{color}` - 기본
- `{color}-hover` - 호버 상태
- `{color}-pressed` - 눌림 상태
- `{color}-focus` - 포커스 상태
- `{color}-fill` - 배경 색상
- `{color}-reverse` - 반전 색상
- `{color}-outline` - 아웃라인 색상

### CSS 클래스 사용

```html
<!-- 텍스트 색상 -->
<div class="primary">Primary 색상 텍스트</div>

<!-- 배경 색상 -->
<div class="bg-primary">Primary 배경</div>

<!-- 테두리 색상 -->
<div class="border-primary">Primary 테두리</div>
```

### SCSS 함수 사용

```scss
.myButton {
  color: color(primary-reverse);
  background-color: color(primary);
  border: 1px solid color(primary);

  &:hover {
    background-color: color(primary-hover);
  }
}
```

### 커스텀 색상 설정 (프로젝트에 이미 적용됨)

```scss
// src/styles/variables.scss
:root {
  --color-primary: #2D6AF6;
  --color-primary-hover: #1F61E6;
  --color-primary-pressed: #004AC3;
  --color-primary-focus: #1F61E6;
  --color-primary-fill: #ECF1FF;
  --color-primary-reverse: #FFFFFF;
  --color-primary-outline: rgba(31, 97, 230, 0.3);
}

html[data-color-mode='dark'] {
  --color-primary: #4D79FF;
  --color-primary-hover: #7393FF;
  // ...
}
```

### 다크 모드 설정

```typescript
// Light 모드
document.documentElement.setAttribute('data-color-mode', 'light');

// Dark 모드
document.documentElement.setAttribute('data-color-mode', 'dark');

// 자동 (브라우저 설정 따름)
document.documentElement.setAttribute('data-color-mode', '');
```

### 색상 톤 설정

```typescript
// 기본 톤
document.documentElement.setAttribute('data-color-tone', '');

// Warm 톤
document.documentElement.setAttribute('data-color-tone', 'warm');
```

---

## 버튼

### 기본 버튼

```html
<button>기본 버튼</button>
<button class="primary">Primary 버튼</button>
<button class="danger">Danger 버튼</button>
<button disabled>비활성화</button>
```

### 버튼 변형

```html
<!-- Fill 스타일 (배경색 연함) -->
<button class="primary-fill">Primary Fill</button>

<!-- Border 스타일 (테두리만) -->
<button class="primary-border">Primary Border</button>

<!-- Text 스타일 (텍스트만) -->
<button class="primary-text">Primary Text</button>
```

### 버튼 크기 (CSS 직접 지정)

```html
<button class="primary" style="padding: 0.5rem 1rem; font-size: 0.875rem">Small</button>
<button class="primary" style="padding: 0.75rem 1.5rem; font-size: 1rem">Medium</button>
<button class="primary" style="padding: 1rem 2rem; font-size: 1.125rem">Large</button>
```

---

## 레이아웃

### 여백 (Spacing)

**클래스 사용:**
```html
<div class="spacing-4">여백 4</div>
<div class="spacing-8">여백 8</div>
```

**SCSS 함수 사용:**
```scss
.container {
  margin: s(4);
  padding: s(8);
  gap: s(2);
}
```

**사용 가능한 값:** 0 ~ 13

### 테두리 반경 (Border Radius)

**클래스 사용:**
```html
<div class="r-2">작은 모서리</div>
<div class="r-4">중간 모서리</div>
<div class="r-full">완전한 원</div>
```

**SCSS 함수 사용:**
```scss
.card {
  border-radius: r(4);
}
```

**사용 가능한 값:** 0 ~ 6, 'full'

### 테두리 두께 (Border)

**클래스 사용:**
```html
<div class="border-1">테두리 1px</div>
<div class="border-4">테두리 4px</div>
```

**SCSS 함수 사용:**
```scss
.box {
  border-width: border(2);
}
```

**사용 가능한 값:** 0 ~ 4

---

## 그리드 시스템

### 기본 그리드 (Auto Wrap)

```html
<section class="grid">
  <div class="w-4">4/12 (33.33%)</div>
  <div class="w-4">4/12 (33.33%)</div>
  <div class="w-4">4/12 (33.33%)</div>
  <div class="w-6">6/12 (50%)</div>
  <div class="w-6">6/12 (50%)</div>
</section>
```

**특징:**
- PC: 12 그리드
- Tablet: 6 그리드
- Mobile: 4 그리드
- 자동 줄바꿈

**사용 가능한 클래스:** `w-1` ~ `w-12`

### 고정 그리드 (Fixed Columns)

```html
<!-- 4열 고정 그리드 -->
<section class="grid-fix-4">
  <div class="w-1_4">25%</div>
  <div class="w-2_4">50%</div>
  <div class="w-1_4">25%</div>
</section>

<!-- 6열 고정 그리드 -->
<section class="grid-fix-6">
  <div class="w-2_6">33.33%</div>
  <div class="w-4_6">66.67%</div>
</section>
```

**사용 가능한 그리드:** `grid-fix-2` ~ `grid-fix-6`

---

## 폼 요소

### 입력 필드

```html
<input type="text" placeholder="텍스트 입력">
<input type="email" placeholder="이메일">
<input type="password" placeholder="비밀번호">
```

### Select

```html
<select>
  <option>옵션 1</option>
  <option>옵션 2</option>
  <option>옵션 3</option>
</select>
```

### Textarea

```html
<textarea rows="5" placeholder="내용을 입력하세요"></textarea>
```

### Checkbox & Radio

```html
<input type="checkbox" id="check1">
<label for="check1">체크박스</label>

<input type="radio" name="radio" id="radio1">
<label for="radio1">라디오 1</label>
```

### Toggle

```html
<input type="checkbox" class="toggle" id="toggle1">
<label for="toggle1">토글 스위치</label>
```

---

## 분자 컴포넌트 (Molecule)

### Pagination

```html
<nav class="pagination">
  <button class="prev">이전</button>
  <button class="active">1</button>
  <button>2</button>
  <button>3</button>
  <button class="next">다음</button>
</nav>
```

### Tab

```html
<div class="tab">
  <button class="active">탭 1</button>
  <button>탭 2</button>
  <button>탭 3</button>
</div>
```

### Table

```html
<table>
  <thead>
    <tr>
      <th>제목 1</th>
      <th>제목 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>데이터 1</td>
      <td>데이터 2</td>
    </tr>
  </tbody>
</table>
```

---

## 타이포그래피

### 폰트 패밀리 설정

```scss
:root {
  --base-font-family: 'Pretendard', sans-serif;
}
```

### 헤딩

```html
<h1>Heading 1</h1>
<h2>Heading 2</h2>
<h3>Heading 3</h3>
<h4>Heading 4</h4>
<h5>Heading 5</h5>
<h6>Heading 6</h6>
```

---

## 주의사항

1. **⚠️ Import 경로 (매우 중요!)**
   ```tsx
   // ✅ 올바른 방법 - React 컴포넌트는 'podo-ui/react'에서
   import { Input, Textarea, Editor, Field } from 'podo-ui/react';

   // ❌ 잘못된 방법 - 이렇게 하면 오류 발생!
   import { Input } from 'podo-ui';

   // Global SCSS
   import 'podo-ui/global.scss';

   // SCSS Module에서 믹스인
   @use 'podo-ui/mixin' as *;
   ```

2. **CSS 클래스 vs React 컴포넌트**
   - podo-ui는 주로 CSS 클래스 기반 시스템입니다
   - Button, Alert 등은 **컴포넌트가 없습니다** - HTML 요소에 클래스를 적용하여 사용
   - React 컴포넌트는 **Input, Textarea, Editor, Field만** 제공됩니다

   ```tsx
   // ❌ 잘못된 사용 (Button 컴포넌트 없음)
   import { Button } from 'podo-ui/react';
   <Button color="primary">버튼</Button>

   // ✅ 올바른 사용 (HTML + CSS 클래스)
   <button className="primary">버튼</button>
   ```

3. **색상 시스템**
   - 색상은 CSS 변수로 제공되며 커스터마이징 가능
   - 필요시 `src/styles/variables.scss`에서 추가 커스터마이징 가능

4. **반응형**
   - 그리드 시스템은 자동으로 반응형 지원
   - PC(12), Tablet(6), Mobile(4) 그리드로 자동 변경

---

## 참고 링크

- GitHub: https://github.com/hada0127/podo-ui
- Issues: https://github.com/hada0127/podo-ui/issues
