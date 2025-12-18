# Svelte 컴포넌트 작업

Svelte 5 컴포넌트 관련 작업을 수행합니다.

## 주요 작업

### 1. 컴포넌트 확인
```bash
# svelte 폴더 구조 확인
ls -la svelte/atom/
ls -la svelte/molecule/
```

### 2. 빌드
```bash
# Svelte 라이브러리만 빌드
npm run build:svelte

# 전체 빌드
npm run build:all
```

### 3. 타입 체크
```bash
npx svelte-check
```

## 컴포넌트 구조

### Atom
- Avatar, Button, Checkbox, Chip, EditorView
- File, Input, Label, Radio, RadioGroup
- Select, Textarea, Toggle, Tooltip

### Molecule
- Field, Pagination, Tab, TabPanel
- Table, Toast, ToastProvider

## Import 방식

```typescript
// 전체 import
import { Input, Button, Field } from 'podo-ui/svelte';

// 개별 import
import Input from 'podo-ui/svelte/atom/Input';
import Field from 'podo-ui/svelte/molecule/Field';
```

## 네이밍 규칙

- 파일명: PascalCase (예: `Input.svelte`)
- 컴포넌트명: PascalCase (예: `Input`)
- Props: camelCase (예: `maxLength`)

## 참조 문서

- `.claude/docs/svelte-components.md` - Svelte 컴포넌트 상세 문서
- `.claude/docs/build-system.md` - 빌드 시스템 문서
