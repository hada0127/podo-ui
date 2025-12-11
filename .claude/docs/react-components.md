# React 컴포넌트

## Atom (원자 컴포넌트)

### Avatar
프로필 이미지/아이콘/텍스트 표시
```tsx
import { Avatar } from 'podo-ui'

<Avatar type="image" src="/profile.jpg" size={56} />
<Avatar type="icon" icon="icon-user" size={40} />
<Avatar type="text" text="홍길동" size={56} activityRing={true} />
```
- **타입**: image, icon, text
- **크기**: 16, 20, 24, 28, 32, 36, 40, 48, 56
- **Activity Ring**: 활동 상태 표시

### Input
검증 기능 입력 필드
```tsx
import { Input } from 'podo-ui/react'
import { z } from 'zod'

<Input
  value={email}
  validator={z.string().email()}
  placeholder="이메일"
  withIcon="mail"
/>
```
- Zod 검증 통합
- 아이콘 지원 (좌/우)
- 자동 상태 표시 (success/danger)

### Textarea
텍스트영역 (Input과 동일한 검증 패턴)

### Editor
WYSIWYG 에디터
```tsx
import { Editor } from 'podo-ui/next'

<Editor
  value={content}
  onChange={setContent}
  height="400px"
/>
```
- 이미지/유튜브 삽입
- 텍스트 서식
- 리사이즈 가능

### EditorView
Editor 콘텐츠 읽기 전용 표시
```tsx
import { EditorView } from 'podo-ui/react'

<EditorView value={htmlContent} />
```

### Label
폼 라벨 컴포넌트
```tsx
import { Label } from 'podo-ui'

<Label>사용자 이름</Label>
<Label size="lg" semibold>큰 굵은 라벨</Label>
<Label required>이메일</Label>
<Label htmlFor="email">이메일</Label>
```
- **크기**: sm, md(기본), lg
- **스타일**: semibold, disabled
- **필수 표시**: required prop

### Button
버튼 컴포넌트
```tsx
import { Button } from 'podo-ui'

<Button>기본 버튼</Button>
<Button theme="primary" variant="solid">Primary Solid</Button>
<Button theme="danger" variant="border" size="lg">Large Danger</Button>
<Button icon="icon-plus">아이콘 버튼</Button>
<Button loading>로딩 중</Button>
```
- **테마**: default, primary, default-deep, info, link, success, warning, danger
- **변형**: solid, fill, border, text
- **크기**: xxs, xs, sm(기본), md, lg

### Checkbox
체크박스 컴포넌트
```tsx
import { Checkbox } from 'podo-ui'

<Checkbox checked={checked} onChange={handleChange} />
<Checkbox label="동의합니다" />
<Checkbox indeterminate label="전체 선택" />
```
- **라벨 지원**: label prop
- **Indeterminate**: 전체 선택 패턴

### Radio / Radio.Group
라디오 버튼 컴포넌트
```tsx
import { Radio } from 'podo-ui'

<Radio name="option" value="a" label="옵션 A" />
<Radio.Group
  name="options"
  value={value}
  options={[
    { value: 'a', label: '옵션 A' },
    { value: 'b', label: '옵션 B' },
  ]}
  onChange={setValue}
/>
```
- **그룹 컴포넌트**: Radio.Group
- **수직 레이아웃**: vertical prop

### Select
셀렉트 박스 컴포넌트
```tsx
import { Select } from 'podo-ui'

<Select
  value={value}
  options={[
    { value: 'kr', label: '한국' },
    { value: 'us', label: '미국' },
  ]}
  placeholder="국가 선택"
  onChange={handleChange}
/>
```
- **아이콘 지원**: withIcon prop

### Toggle
토글 스위치 컴포넌트
```tsx
import { Toggle } from 'podo-ui'

<Toggle checked={on} onChange={handleChange} />
<Toggle label="알림 받기" />
```
- **라벨 지원**: label prop

### FileInput
파일 업로드 컴포넌트
```tsx
import { FileInput } from 'podo-ui'

<FileInput accept="image/*" onChange={handleChange} />
<FileInput multiple onFileSelect={(files) => setFiles(files)} />
```
- **파일 타입 제한**: accept prop
- **다중 선택**: multiple prop

### Chip
태그/칩 컴포넌트

### Tooltip
툴팁 컴포넌트

---

## Molecule (분자 컴포넌트)

### DatePicker
날짜/시간 선택기
```tsx
import { DatePicker } from 'podo-ui'

<DatePicker mode="instant" type="date" />
<DatePicker mode="period" type="datetime" />
```
- **mode**: instant (단일), period (기간)
- **type**: date, time, datetime
- CDN Vanilla JS 버전 지원

### Field
폼 필드 래퍼
```tsx
import { Field, Input } from 'podo-ui/react'

<Field label="이메일" required>
  <Input value={email} onChange={setEmail} />
</Field>
```

### Pagination
페이지네이션
```tsx
import { Pagination } from 'podo-ui/react'

<Pagination
  currentPage={1}
  totalPages={10}
  onPageChange={setPage}
/>
```

### Toast / ToastProvider
토스트 알림 시스템

### Tab / Tab.Panel
탭 컴포넌트
```tsx
import { Tab } from 'podo-ui'

const [activeKey, setActiveKey] = useState('tab1');

<Tab
  items={[
    { key: 'tab1', label: '탭 1' },
    { key: 'tab2', label: '탭 2' },
    { key: 'tab3', label: '탭 3', disabled: true },
  ]}
  activeKey={activeKey}
  onChange={setActiveKey}
/>
<Tab.Panel tabKey="tab1" activeKey={activeKey}>탭 1 내용</Tab.Panel>
<Tab.Panel tabKey="tab2" activeKey={activeKey}>탭 2 내용</Tab.Panel>
```
- **제어/비제어**: activeKey vs defaultActiveKey
- **균등 너비**: fill prop
- **비활성화**: item.disabled

### Table
테이블 컴포넌트
```tsx
import { Table } from 'podo-ui'

<Table
  columns={[
    { key: 'name', title: '이름' },
    { key: 'email', title: '이메일' },
    { key: 'action', title: '액션', render: (_, record) => <button>편집</button> },
  ]}
  dataSource={data}
  rowKey="id"
/>
```
- **스타일**: list (호버), border (테두리), fill (배경)
- **행 클릭**: onRowClick
- **커스텀 렌더**: column.render

---

## 내보내기

### 기본 (index.ts)
```typescript
import {
  Input, Textarea, Editor, EditorView,
  Label, Button, Checkbox, Radio, Select, Toggle, FileInput,
  Avatar, Chip, Tooltip,
  Pagination, Field, DatePicker, Tab, Table
} from 'podo-ui'
```

### 개별 import
```typescript
import Input from 'podo-ui/react/atom/input'
import Button from 'podo-ui/react/atom/button'
import DatePicker from 'podo-ui/react/molecule/datepicker'
import Tab from 'podo-ui/react/molecule/tab'
```

### Form 객체
```typescript
import Form from 'podo-ui'

// Form.Input, Form.Textarea, Form.Editor, Form.Label, Form.Button 등
<Form.Input value={value} onChange={setValue} />
<Form.Label required>이메일</Form.Label>
<Form.Button theme="primary">제출</Form.Button>
```
