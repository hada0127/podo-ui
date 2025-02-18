# Podo-ui
- SCSS Module 기반 디자인 시스템


# SCSS

## 기본 적용

```js
import 'podo-ui/global.scss';
```

### SCSS Module 내에서 변수, 함수, 믹스인 활용

👉 파일의 최상단에 아래 파일 선언

```scss
@use 'podo-ui/mixin' as *;
```

## Variables

### Color Tone

👉 회색의 톤을 결정함. 기본값(미설정) 과 warm으로 선택할 수 있음.
👉 js에서 아래와 같이 설정(warm)

```js
// 기본값
document.documentElement.setAttribute('data-color-tone', '');

// warm 톤
document.documentElement.setAttribute('data-color-tone', 'warm');
```

### Dark Mode

👉 다크모드를 설정함. 기본값(자동, 브라우저 설정에 따름)과 'light', 'dark'를 선택할 수 있음.

```js
// 기본값(자동)
document.documentElement.setAttribute('data-color-mode', '');

// light 모드
document.documentElement.setAttribute('data-color-mode', 'light');

// dark 모드
document.documentElement.setAttribute('data-color-mode', 'dark');
```

### Font family

👉 font-family를 설정. scss에서 덮어쓰기

```scss
:root {
  --base-font-family: 'Pretendard', sans-serif;
}
```

## 색상

### 적용 색상 종류

👉 선택 가능한 색상 종류 : primary, default, default-deep, info, link, success, warning, danger  
👉 선택 가능한 색상의 하위 색상으로 색상명-fill과 색상명-reverse가 존재한다.  
👉 위 선택자에 없는 text, border, bg, bg-elevation은 시스템 내 자동 적용한다.

### CSS 선택자 사용

👉 아래와 같이 직접 선택자를 넣어 사용

```html
<div className="primary">primary color</div>
<div className="bg-primary">primary background color</div>
```

### SCSS 내에서 함수 사용

```scss
p {
  color: color(값);
}
```

### 커스컴 컬러

👉 아래 형태로 css 변수를 커스텀하여 사용

```scss
:root {
  --color-primary: #f34a35;
  --color-primary-hover: #dd2d0f;
  --color-primary-pressed: #c9280c;
  --color-primary-focus: #dd2d0f;
  --color-primary-fill: #fff8f7;
  --color-primary-reverse: #ffffff;
}
html[data-color-mode='dark'] {
  --color-primary: #ff5d49;
  --color-primary-hover: #ff7564;
  --color-primary-pressed: #ff5d49;
  --color-primary-focus: #ff7564;
  --color-primary-fill: #1c1c20;
}
```

## 그리드

### 기본 그리드 시스템 ( 4 ~ 12 columns / auto wrap)

👉 css에서 .grid 속성으로 기본 그리드 시스템을 설정합니다.

```html
<section className="grid">
  <div className="w-4">w-4</div>
  <div className="w-4">w-4</div>
  <div className="w-4">w-4</div>
</section>
```

👉 그리드 내 하위 요소가 중단점 이상일 경우 자동으로 줄바꿈 합니다.  
👉 w-{숫자} 형태로 이루어져있으며 1~12 그리드가 존재합니다.  
👉 {숫자} / 12 \* 100% 한 값을 전체 그리드 내의 비율로 사용합니다.  
👉 예: w-1은 1 / 12 \* 100 = 8.333% 크기, w-6은 6 / 12 \* 100 = 50% 크기를 차지합니다.
👉 PC는 12 그리드, Tablet은 6 그리드, Mobile은 4 그리드를 기본으로 한다.

### 고정 그리드 시스템

👉 디바이스에 관계없이 디바이스의 너비를 유지하고 줄바꿈을 하지 않습니다.  
👉 css에서 grid-fix-2 ~ grid-gix-6 로 2 ~ 6개의 컬럼을 가진 그리드 시스템을 설정합니다.  
👉 4그리드일 경우 CSS에서 하위 구성요소는 w-1_4, w-2_4, w-3_4가 존재합니다.w-1_4은 1/4(25%)  
👉 크기, w-2_4는 2/4(50%) 크기, w-3_4는 3/4(75%) 크기를 차지합니다.  
👉 Fixed wrap grid에서는 w-full로 하위 구성요소를 그리드 시스템내에 100% 크기를 차지하도록 설정할 수 있습니다.

## 레이아웃

### 테두리 두께 (border)

👉 border 함수 혹은 class 사용 사용 (0 ~ 4)

```scss
p {
  margin: border(값);
}
```

```html
<p className="border-4">border-4</p>
```

### 테두리 반경 (border radius)

👉 r 함수 혹은 class 사용 (0 ~ 6, 'full')

```scss
p {
  margin: r(값);
}
```

```html
<p className="r-4">r-4</p>
```

### 여백 (spacing)

👉 spacing 함수 혹은 class 사용 (0 ~ 13)

```scss
p {
  margin: s(값);
}
```

```html
<p className="spacing-4">spacing-4</p>
```

## 입력요소

### 토글 (toggle)

👉 checkbox에 .toggle 클래스 사용

```html
<input type="checkbox" className="toggle" />
```

## 아이콘 생성 방법

👉 디자인 시스템 피그마에서 상태를 선택한 후 svg로 export 할 것
👉 폰트포지에서 icon.woff 폰트 생성
👉 /scss/icon/font 경로에 icon.woff 복사
👉 쉘에서 아래 스크립트 실행

```sh
npm run icon
```
