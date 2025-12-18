# Svelte 5 컴포넌트

## 개요

podo-ui는 Svelte 5를 지원합니다. SCSS 기반 스타일을 공유하면서 Svelte 5의 runes와 함께 사용할 수 있습니다.

## 설치

```bash
npm install podo-ui svelte@^5
```

## Import

```typescript
// 전체 import
import { Input, Button, Field, Table } from 'podo-ui/svelte';

// 개별 import
import Input from 'podo-ui/svelte/atom/Input';
import Field from 'podo-ui/svelte/molecule/Field';
```

## 컴포넌트 목록

### Atom (원자 컴포넌트)

| 컴포넌트 | 설명 | Import |
|----------|------|--------|
| Avatar | 프로필 이미지 | `podo-ui/svelte/atom/Avatar` |
| Button | 버튼 | `podo-ui/svelte/atom/Button` |
| Checkbox | 체크박스 | `podo-ui/svelte/atom/Checkbox` |
| Chip | 태그/칩 | `podo-ui/svelte/atom/Chip` |
| EditorView | 에디터 뷰어 | `podo-ui/svelte/atom/EditorView` |
| File | 파일 입력 | `podo-ui/svelte/atom/File` |
| Input | 입력 필드 | `podo-ui/svelte/atom/Input` |
| Label | 라벨 | `podo-ui/svelte/atom/Label` |
| Radio | 라디오 버튼 | `podo-ui/svelte/atom/Radio` |
| RadioGroup | 라디오 그룹 | `podo-ui/svelte/atom/RadioGroup` |
| Select | 셀렉트 박스 | `podo-ui/svelte/atom/Select` |
| Textarea | 텍스트영역 | `podo-ui/svelte/atom/Textarea` |
| Toggle | 토글 스위치 | `podo-ui/svelte/atom/Toggle` |
| Tooltip | 툴팁 | `podo-ui/svelte/atom/Tooltip` |

### Molecule (분자 컴포넌트)

| 컴포넌트 | 설명 | Import |
|----------|------|--------|
| Field | 폼 필드 래퍼 | `podo-ui/svelte/molecule/Field` |
| Pagination | 페이지네이션 | `podo-ui/svelte/molecule/Pagination` |
| Tab | 탭 | `podo-ui/svelte/molecule/Tab` |
| TabPanel | 탭 패널 | `podo-ui/svelte/molecule/TabPanel` |
| Table | 테이블 | `podo-ui/svelte/molecule/Table` |
| Toast | 토스트 알림 | `podo-ui/svelte/molecule/Toast` |
| ToastProvider | 토스트 제공자 | `podo-ui/svelte/molecule/ToastProvider` |

## 사용 예시

### 기본 사용

```svelte
<script lang="ts">
  import { Input, Button, Field } from 'podo-ui/svelte';

  let name = $state('');
  let email = $state('');
</script>

<Field label="이름" required>
  <Input bind:value={name} placeholder="이름을 입력하세요" />
</Field>

<Field label="이메일">
  <Input type="email" bind:value={email} />
</Field>

<Button onclick={() => console.log({ name, email })}>
  제출
</Button>
```

### 테이블

```svelte
<script lang="ts">
  import { Table, type TableColumn } from 'podo-ui/svelte';

  const data = [
    { id: '1', name: '홍길동', email: 'hong@example.com', role: '관리자' },
    { id: '2', name: '김철수', email: 'kim@example.com', role: '사용자' }
  ];

  // TableColumn의 key는 data의 키와 일치, title은 헤더 텍스트
  const columns: TableColumn<typeof data[0]>[] = [
    { key: 'name', title: '이름' },
    { key: 'email', title: '이메일' },
    { key: 'role', title: '역할' }
  ];
</script>

<!-- dataSource: 데이터 배열, rowKey: 고유 식별자 -->
<Table {columns} dataSource={data} rowKey="id" />

<!-- 옵션: list (호버효과), border (셀 테두리), fill (배경색) -->
<Table {columns} dataSource={data} rowKey="id" list border />

<!-- 클릭 이벤트 (React: onRowClick, Svelte: onrowclick) -->
<Table {columns} dataSource={data} rowKey="id" list onrowclick={(record) => console.log(record)} />
```

### 탭

```svelte
<script lang="ts">
  import { Tab, TabPanel, type TabItem } from 'podo-ui/svelte';

  let activeTab = $state('tab1');

  // TabItem: key (필수), label (필수), disabled (옵션)
  const items: TabItem[] = [
    { key: 'tab1', label: '탭 1' },
    { key: 'tab2', label: '탭 2' },
    { key: 'tab3', label: '탭 3', disabled: true }
  ];
</script>

<!-- 기본 사용 (React: onChange, Svelte: onchange) -->
<Tab {items} activeKey={activeTab} onchange={(key) => activeTab = key} />

<!-- 또는 defaultActiveKey로 초기값만 설정 -->
<Tab {items} defaultActiveKey="tab1" />

<!-- fill 옵션: 탭이 동일한 너비로 확장 -->
<Tab {items} fill activeKey={activeTab} onchange={(key) => activeTab = key} />

<!-- TabPanel과 함께 사용 -->
<Tab {items} activeKey={activeTab} onchange={(key) => activeTab = key} />
<TabPanel tabKey="tab1" activeKey={activeTab}>첫 번째 탭 내용</TabPanel>
<TabPanel tabKey="tab2" activeKey={activeTab}>두 번째 탭 내용</TabPanel>
```

### 토스트

```svelte
<script lang="ts">
  import { ToastProvider, Toast } from 'podo-ui/svelte';
  import { getToastContext } from 'podo-ui/svelte';

  const toast = getToastContext();
</script>

<ToastProvider>
  <button onclick={() => toast.success('저장되었습니다!')}>
    성공 토스트
  </button>
  <button onclick={() => toast.error('오류가 발생했습니다')}>
    에러 토스트
  </button>
</ToastProvider>
```

## React와의 차이점

| 항목 | React | Svelte 5 |
|------|-------|----------|
| 상태 관리 | useState | $state |
| 양방향 바인딩 | value + onChange | bind:value |
| 이벤트 핸들러 | onClick | onclick |
| 파일 네이밍 | input.tsx (소문자) | Input.svelte (PascalCase) |

### 콜백 Props 네이밍 차이 (중요!)

Svelte는 DOM 이벤트 네이밍 규칙을 따르므로 콜백이 소문자입니다:

| 컴포넌트 | React | Svelte |
|----------|-------|--------|
| Tab | `onChange` | `onchange` |
| Table | `onRowClick` | `onrowclick` |
| Pagination | `onPageChange` | `onPageChange` (동일) |
| Toast | `onClose` | `onClose` (동일) |

### Props 타입 참조

```typescript
// Tab
import { Tab, type TabItem } from 'podo-ui/svelte';
// TabItem: { key: string, label: string, disabled?: boolean }

// Table
import { Table, type TableColumn } from 'podo-ui/svelte';
// TableColumn<T>: { key: keyof T, title: string, width?: string, align?: 'left'|'center'|'right' }

// Select
import { Select, type SelectOption } from 'podo-ui/svelte';
// SelectOption: { value: string, label: string }
```

## 스타일링

Svelte 컴포넌트도 동일한 SCSS 클래스를 사용합니다:

```svelte
<script>
  import 'podo-ui/global.scss';
</script>

<!-- SCSS 클래스 직접 사용 가능 -->
<input class="input input--error" />
<button class="button button--primary">버튼</button>
```

## 빌드

```bash
# Svelte 라이브러리만 빌드
npm run build:svelte

# 전체 빌드 (React + Svelte + CDN)
npm run build:all
```
