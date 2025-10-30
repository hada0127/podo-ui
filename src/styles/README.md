# 공통 페이지 스타일 가이드

이 폴더에는 문서 페이지에서 공통으로 사용할 수 있는 SCSS 믹스인이 포함되어 있습니다.

## 사용법

페이지의 SCSS 모듈 파일에서 다음과 같이 import합니다:

```scss
@use '../../../../mixin' as *;
@use '../../../../styles/common-page' as *;
```

## 제공되는 믹스인

### 1. Note 스타일

정보성 메시지를 표시할 때 사용합니다.

```scss
.note {
  @include note-style;
}
```

**HTML 구조:**
```tsx
<div className={styles.note}>
  <i className="icon-info"></i>
  <div>
    <strong>참고:</strong> 여기에 메시지를 입력합니다.
  </div>
</div>
```

### 2. Warning 스타일

경고 메시지를 표시할 때 사용합니다.

```scss
.warning {
  @include warning-style;
}
```

**HTML 구조:**
```tsx
<div className={styles.warning}>
  <i className="icon-warning"></i>
  <div>
    <strong>중요:</strong> 여기에 경고 메시지를 입력합니다.
  </div>
</div>
```

## 특징

- 완전한 반응형 디자인 (1024px, 768px 브레이크포인트)
- 텍스트 오버플로우 방지 (word-wrap, overflow-wrap)
- 모바일 최적화 (작은 폰트, 간격 조정)
- 아이콘과 텍스트의 적절한 배치
- 긴 단어도 자동 줄바꿈

## 기타 믹스인

- `@mixin section-responsive` - 섹션 기본 스타일
- `@mixin codeBlock-responsive` - 코드 블록 스타일
- `@mixin alert-box-responsive` - 기본 알림 박스 스타일 (note, warning의 베이스)
