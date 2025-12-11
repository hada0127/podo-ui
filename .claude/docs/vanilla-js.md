# Vanilla JS 컴포넌트

React 없이 순수 JavaScript로 사용할 수 있는 컴포넌트입니다.

## CDN 사용법

```html
<!-- CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/podo-ui@latest/cdn/podo-ui.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/podo-ui@latest/cdn/podo-datepicker.min.css">

<!-- JS -->
<script src="https://cdn.jsdelivr.net/npm/podo-ui@latest/cdn/podo-datepicker.min.js"></script>
```

---

## DatePicker

### 기본 사용
```html
<div id="my-datepicker"></div>

<script>
const picker = new PodoDatePicker('#my-datepicker', {
  mode: 'instant',  // 'instant' | 'period'
  type: 'date',     // 'date' | 'time' | 'datetime'
  onChange: function(value) {
    console.log('Selected:', value);
  }
});
</script>
```

### 옵션
```javascript
{
  mode: 'instant',           // 선택 모드
  type: 'date',              // 값 타입
  value: { date: new Date() }, // 초기값
  disabled: false,           // 비활성화
  align: 'left',             // 드롭다운 정렬
  showActions: true,         // 하단 버튼
  minuteStep: 15,            // 분 단위
  format: 'y-m-d',           // 표시 포맷

  // 날짜 제한
  minDate: new Date(),
  maxDate: new Date(2025, 11, 31),

  // 비활성화 조건
  disable: [
    new Date(2024, 0, 1),
    { from: new Date(2024, 0, 10), to: new Date(2024, 0, 20) },
    (date) => date.getDay() === 0
  ],

  // 텍스트 커스터마이징
  texts: {
    weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months: ['Jan', 'Feb', 'Mar', ...],
    reset: 'Reset',
    apply: 'Apply'
  }
}
```

### 메서드
```javascript
picker.getValue();    // 현재 값 반환
picker.setValue({...}); // 값 설정
picker.clear();       // 값 초기화
picker.enable();      // 활성화
picker.disable();     // 비활성화
picker.destroy();     // 인스턴스 제거
```

---

## 파일 구조

```
vanilla/
├── datepicker.js       # ES 모듈 소스
└── datepicker.css      # 스타일시트

cdn/
├── podo-datepicker.js      # UMD 버전
├── podo-datepicker.min.js  # 압축 버전
└── podo-datepicker.css     # CDN용 스타일
```

## 빌드

```bash
npm run build:cdn-js
```

## 컬러 상속

CSS 변수는 podo-ui.css에서 상속:
```css
--podo-primary: var(--color-primary, #7c3aed);
```
