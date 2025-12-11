# SCSS 스타일 작업

작업: $ARGUMENTS

---

## 주요 파일
| 파일 | 용도 |
|------|------|
| `global.scss` | 글로벌 진입점 |
| `mixin.scss` | 외부용 함수/믹스인 |
| `scss/_variables.scss` | 변수 정의 |
| `scss/_mixin.scss` | 내부 믹스인 |

## CSS 변수
```scss
--color-primary: #7c3aed;
--color-bg-block: #ffffff;
--color-text-body: #212121;
--spacing-1: 4px;
--radius-2: 4px;
```

## SCSS 함수
```scss
@use 'podo-ui/mixin' as *;

.example {
  padding: s(5);              // 간격
  background: color(primary); // 색상
  border-radius: r(3);        // 반경
}
```

## 빌드
```bash
npm run build:cdn  # CDN용 CSS 생성
```

요청에 따라 스타일을 수정해주세요.
