# i18n 설정 문제 해결 가이드

## 문제: 새 컴포넌트 페이지에서 `MISSING_MESSAGE` 에러 발생

### 증상
```
IntlError: MISSING_MESSAGE: Could not resolve `[component-name]` in messages for locale `ko`.
```

새로운 컴포넌트 페이지를 추가했을 때 위와 같은 에러가 발생하며 번역이 로드되지 않습니다.

### 근본 원인

이 프로젝트는 **두 곳에서 i18n 메시지를 로드**하고 있습니다:

1. **`i18n/request.ts`** - next-intl 플러그인용 설정 파일 (현재 사용되지 않음)
2. **`src/app/layout.tsx`** - 실제로 App Router에서 사용되는 메시지 로더 ✅

`next.config.mjs`에서 `createNextIntlPlugin('./i18n/request.ts')`로 설정되어 있지만, **실제로는 `src/app/layout.tsx`의 `loadMessages` 함수에서 직접 메시지를 로드**하고 있습니다.

따라서 `i18n/request.ts`만 수정해서는 새로운 번역이 반영되지 않습니다.

### 해결 방법

새로운 컴포넌트를 추가할 때는 다음 **3곳**을 모두 수정해야 합니다:

#### 1. 번역 파일 생성
```bash
i18n/locales/ko/[component-name].json
i18n/locales/en/[component-name].json
```

예시 (`tooltip.json`):
```json
{
  "title": "툴팁",
  "description": "툴팁 컴포넌트는 요소에 마우스를 올렸을 때 추가 정보를 표시합니다."
}
```

#### 2. `src/app/layout.tsx` 수정 (중요!)

**import 추가:**
```typescript
// Components 섹션에 추가
const [componentName] = (await import(`../../i18n/locales/${locale}/[component-name].json`)).default;
```

**return 객체에 추가:**
```typescript
return {
  // ... 기존 항목들
  [componentName],  // 추가
  // ... 나머지 항목들
};
```

#### 3. `i18n/request.ts` 수정 (선택사항)

일관성을 위해 `i18n/request.ts`도 동일하게 수정하는 것을 권장합니다.

### 실제 예시: Tooltip 컴포넌트 추가

#### 1단계: 번역 파일 생성
- `i18n/locales/ko/tooltip.json`
- `i18n/locales/en/tooltip.json`

#### 2단계: `src/app/layout.tsx` 수정

**Before:**
```typescript
const toast = (await import(`../../i18n/locales/${locale}/toast.json`)).default;

// Utilities
const border = ...
```

**After:**
```typescript
const toast = (await import(`../../i18n/locales/${locale}/toast.json`)).default;
const tooltip = (await import(`../../i18n/locales/${locale}/tooltip.json`)).default;

// Utilities
const border = ...
```

**return 객체도 수정:**
```typescript
return {
  // ...
  toast,
  tooltip,  // 추가
  border,
  // ...
};
```

#### 3단계: 캐시 삭제 및 서버 재시작
```bash
# 빌드 캐시 삭제
rm -rf .next

# 개발 서버 재시작
npm run dev
```

### 주의사항

1. **개발 서버 재시작 필수**:
   - `layout.tsx` 같은 서버 컴포넌트 파일을 수정하면 반드시 서버를 재시작해야 합니다
   - Hot Reload가 작동하지 않습니다

2. **두 파일 모두 수정**:
   - `src/app/layout.tsx` (필수)
   - `i18n/request.ts` (일관성 유지를 위해 권장)

3. **import 순서**:
   - 기존 코드의 순서(Getting Started, Foundation, Components, Utilities)를 유지하세요

### 체크리스트

새 컴포넌트 페이지 추가 시:
- [ ] `i18n/locales/ko/[name].json` 생성
- [ ] `i18n/locales/en/[name].json` 생성
- [ ] `src/app/layout.tsx`의 `loadMessages`에 import 추가
- [ ] `src/app/layout.tsx`의 return 객체에 추가
- [ ] `i18n/request.ts`에도 동일하게 추가 (선택)
- [ ] `.next` 캐시 삭제
- [ ] 개발 서버 재시작
- [ ] 페이지에서 정상 작동 확인

### 디버깅 팁

1. **에러가 계속 발생하면**:
   ```bash
   # 캐시 완전 삭제
   rm -rf .next
   rm -rf node_modules/.cache

   # 서버 재시작
   npm run dev
   ```

2. **번역 파일이 제대로 생성되었는지 확인**:
   ```bash
   ls -la i18n/locales/ko/[component-name].json
   ls -la i18n/locales/en/[component-name].json
   ```

3. **JSON 문법 오류 확인**:
   - JSON 파일에 trailing comma가 없는지 확인
   - 따옴표가 올바른지 확인

### 관련 파일

- `src/app/layout.tsx` - 메인 i18n 설정 (실제 사용)
- `i18n/request.ts` - next-intl 플러그인 설정 (일관성 유지용)
- `next.config.mjs` - Next.js 및 i18n 플러그인 설정
- `i18n/locales/[locale]/` - 번역 파일 디렉토리

### 마지막 수정일
2025-11-21
