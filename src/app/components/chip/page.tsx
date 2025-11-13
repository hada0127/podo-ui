'use client';

import { useState } from 'react';
import styles from '../input/page.module.scss';
import Chip from '../../../../react/atom/chip';

export default function ChipPage() {
  const [tags, setTags] = useState([
    { id: 1, label: 'React' },
    { id: 2, label: 'TypeScript' },
    { id: 3, label: 'Next.js' },
  ]);

  const handleDelete = (id: number) => {
    setTags(tags.filter((tag) => tag.id !== id));
  };

  return (
    <>
      <section className={styles.section}>
        <h1>Chip</h1>
        <p>Podo UI의 Chip 컴포넌트와 사용법을 안내합니다.</p>
      </section>

      <section className={styles.section}>
        <h2>개요</h2>
        <p>
          Chip은 작은 정보 조각을 표시하는 컴포넌트입니다. 태그, 레이블, 필터 등으로 활용할 수 있습니다.
          CSS 클래스 기반으로 동작하며, HTML 구조만으로 쉽게 사용할 수 있습니다.
        </p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>기본 예제:</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div className="chip">
              <i className="icon icon-ellipse" />
              Label
            </div>
            <div className="chip blue">
              <i className="icon icon-ellipse" />
              Label
            </div>
            <div className="chip green">
              <i className="icon icon-ellipse" />
              Label
            </div>
            <div className="chip orange">
              <i className="icon icon-ellipse" />
              Label
            </div>
            <div className="chip red">
              <i className="icon icon-ellipse" />
              Label
            </div>
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>basic.html</div>
          <pre><code>{`<!-- Default theme (클래스 생략 가능) -->
<div class="chip">
  <i class="icon icon-ellipse"></i>
  Label
</div>

<!-- 다른 컬러 테마 -->
<div class="chip blue">
  <i class="icon icon-ellipse"></i>
  Label
</div>`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Type</h2>
        <p>Chip은 세 가지 타입을 지원합니다: default(진한 배경), fill(옅은 배경), border(테두리만)</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>Default (진한 배경 - type 클래스 생략):</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div className="chip">
              <i className="icon icon-ellipse" />
              Label
            </div>
            <div className="chip blue">
              <i className="icon icon-ellipse" />
              Label
            </div>
            <div className="chip green">
              <i className="icon icon-ellipse" />
              Label
            </div>
            <div className="chip orange">
              <i className="icon icon-ellipse" />
              Label
            </div>
            <div className="chip red">
              <i className="icon icon-ellipse" />
              Label
            </div>
          </div>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>Fill (옅은 배경):</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div className="chip fill">
              <i className="icon icon-ellipse" />
              Label
            </div>
            <div className="chip fill blue">
              <i className="icon icon-ellipse" />
              Label
            </div>
            <div className="chip fill green">
              <i className="icon icon-ellipse" />
              Label
            </div>
            <div className="chip fill orange">
              <i className="icon icon-ellipse" />
              Label
            </div>
            <div className="chip fill red">
              <i className="icon icon-ellipse" />
              Label
            </div>
          </div>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>Border (테두리만):</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div className="chip border">
              <i className="icon icon-ellipse" />
              Label
            </div>
            <div className="chip border blue">
              <i className="icon icon-ellipse" />
              Label
            </div>
            <div className="chip border green">
              <i className="icon icon-ellipse" />
              Label
            </div>
            <div className="chip border orange">
              <i className="icon icon-ellipse" />
              Label
            </div>
            <div className="chip border red">
              <i className="icon icon-ellipse" />
              Label
            </div>
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>type.html</div>
          <pre><code>{`<!-- Default type (진한 배경 - 클래스 생략) -->
<div class="chip blue">
  <i class="icon icon-ellipse"></i>
  Label
</div>

<!-- Fill type (옅은 배경) -->
<div class="chip fill blue">
  <i class="icon icon-ellipse"></i>
  Label
</div>

<!-- Border type (테두리만) -->
<div class="chip border blue">
  <i class="icon icon-ellipse"></i>
  Label
</div>`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Size</h2>
        <p>두 가지 크기를 지원합니다: sm, md(기본)</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>크기 비교:</div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="chip sm blue">
              <i className="icon icon-ellipse" />
              Small
            </div>
            <div className="chip blue">
              <i className="icon icon-ellipse" />
              Medium (기본)
            </div>
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>size.html</div>
          <pre><code>{`<div class="chip sm blue">
  <i class="icon icon-ellipse"></i>
  Small
</div>

<div class="chip blue">
  <i class="icon icon-ellipse"></i>
  Medium (기본)
</div>`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>아이콘</h2>
        <p>아이콘은 선택적으로 사용할 수 있으며, 다양한 아이콘으로 대체 가능합니다.</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>아이콘 없이:</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div className="chip blue">Label</div>
            <div className="chip green">Label</div>
            <div className="chip orange">Label</div>
          </div>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>기본 ellipse 아이콘:</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div className="chip blue">
              <i className="icon icon-ellipse" />
              Label
            </div>
            <div className="chip green">
              <i className="icon icon-ellipse" />
              Label
            </div>
            <div className="chip orange">
              <i className="icon icon-ellipse" />
              Label
            </div>
          </div>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>다른 아이콘 사용:</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div className="chip blue">
              <i className="icon icon-user" />
              User
            </div>
            <div className="chip green">
              <i className="icon icon-check" />
              Success
            </div>
            <div className="chip orange">
              <i className="icon icon-warning" />
              Warning
            </div>
            <div className="chip red">
              <i className="icon icon-close" />
              Error
            </div>
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>icon.html</div>
          <pre><code>{`<!-- 아이콘 없이 -->
<div class="chip blue">Label</div>

<!-- ellipse 아이콘 -->
<div class="chip blue">
  <i class="icon icon-ellipse"></i>
  Label
</div>

<!-- 커스텀 아이콘 -->
<div class="chip blue">
  <i class="icon icon-user"></i>
  User
</div>`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Round</h2>
        <p>round 클래스를 추가하면 모서리가 완전히 둥글게(pill 형태) 변경됩니다. 기본은 약간 각진 형태입니다.</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>기본 (round=no):</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div className="chip blue">
              <i className="icon icon-ellipse" />
              Label
            </div>
            <div className="chip green">
              <i className="icon icon-ellipse" />
              Label
            </div>
            <div className="chip orange">
              <i className="icon icon-ellipse" />
              Label
            </div>
          </div>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>Round (round=yes):</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div className="chip round blue">
              <i className="icon icon-ellipse" />
              Label
            </div>
            <div className="chip round green">
              <i className="icon icon-ellipse" />
              Label
            </div>
            <div className="chip round orange">
              <i className="icon icon-ellipse" />
              Label
            </div>
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>round.html</div>
          <pre><code>{`<!-- 기본 (약간 각진 모서리) -->
<div class="chip blue">
  <i class="icon icon-ellipse"></i>
  Label
</div>

<!-- Round (완전히 둥근 모서리) -->
<div class="chip round blue">
  <i class="icon icon-ellipse"></i>
  Label
</div>`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>삭제 버튼</h2>
        <p>chip 내부에 button 요소를 추가하면 자동으로 삭제 버튼(×)으로 표시됩니다.</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>삭제 버튼 포함:</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div className="chip blue">
              <i className="icon icon-ellipse" />
              Label
              <button aria-label="삭제" />
            </div>
            <div className="chip green">
              <i className="icon icon-ellipse" />
              Label
              <button aria-label="삭제" />
            </div>
            <div className="chip round orange">
              <i className="icon icon-ellipse" />
              Label
              <button aria-label="삭제" />
            </div>
            <div className="chip round red">
              <i className="icon icon-ellipse" />
              Label
              <button aria-label="삭제" />
            </div>
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>delete.html</div>
          <pre><code>{`<div class="chip blue">
  <i class="icon icon-ellipse"></i>
  Label
  <button aria-label="삭제"></button>
</div>

<script>
  // JavaScript로 삭제 기능 구현
  document.querySelectorAll('.chip button').forEach(button => {
    button.addEventListener('click', (e) => {
      e.target.closest('.chip').remove();
    });
  });
</script>`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>모든 조합</h2>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>Default Type (진한 배경) - Small - 삭제 버튼:</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div className="chip sm">
              <i className="icon icon-ellipse" />
              Label
              <button aria-label="삭제" />
            </div>
            <div className="chip sm blue">
              <i className="icon icon-ellipse" />
              Label
              <button aria-label="삭제" />
            </div>
            <div className="chip sm green">
              <i className="icon icon-ellipse" />
              Label
              <button aria-label="삭제" />
            </div>
            <div className="chip sm orange">
              <i className="icon icon-ellipse" />
              Label
              <button aria-label="삭제" />
            </div>
            <div className="chip sm red">
              <i className="icon icon-ellipse" />
              Label
              <button aria-label="삭제" />
            </div>
          </div>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>Default Type (진한 배경) - Medium - Round - 삭제 버튼:</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div className="chip round">
              <i className="icon icon-ellipse" />
              Label
              <button aria-label="삭제" />
            </div>
            <div className="chip round blue">
              <i className="icon icon-ellipse" />
              Label
              <button aria-label="삭제" />
            </div>
            <div className="chip round green">
              <i className="icon icon-ellipse" />
              Label
              <button aria-label="삭제" />
            </div>
            <div className="chip round orange">
              <i className="icon icon-ellipse" />
              Label
              <button aria-label="삭제" />
            </div>
            <div className="chip round red">
              <i className="icon icon-ellipse" />
              Label
              <button aria-label="삭제" />
            </div>
          </div>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>Fill Type (옅은 배경) - Small - Round - 삭제 버튼:</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div className="chip sm fill round">
              <i className="icon icon-ellipse" />
              Label
              <button aria-label="삭제" />
            </div>
            <div className="chip sm fill round blue">
              <i className="icon icon-ellipse" />
              Label
              <button aria-label="삭제" />
            </div>
            <div className="chip sm fill round green">
              <i className="icon icon-ellipse" />
              Label
              <button aria-label="삭제" />
            </div>
            <div className="chip sm fill round orange">
              <i className="icon icon-ellipse" />
              Label
              <button aria-label="삭제" />
            </div>
            <div className="chip sm fill round red">
              <i className="icon icon-ellipse" />
              Label
              <button aria-label="삭제" />
            </div>
          </div>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>Fill Type (옅은 배경) - Medium:</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div className="chip fill">
              <i className="icon icon-ellipse" />
              Label
            </div>
            <div className="chip fill blue">
              <i className="icon icon-ellipse" />
              Label
            </div>
            <div className="chip fill green">
              <i className="icon icon-ellipse" />
              Label
            </div>
            <div className="chip fill orange">
              <i className="icon icon-ellipse" />
              Label
            </div>
            <div className="chip fill red">
              <i className="icon icon-ellipse" />
              Label
            </div>
          </div>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>Border Type (테두리) - Small:</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div className="chip sm border">
              <i className="icon icon-ellipse" />
              Label
            </div>
            <div className="chip sm border blue">
              <i className="icon icon-ellipse" />
              Label
            </div>
            <div className="chip sm border green">
              <i className="icon icon-ellipse" />
              Label
            </div>
            <div className="chip sm border orange">
              <i className="icon icon-ellipse" />
              Label
            </div>
            <div className="chip sm border red">
              <i className="icon icon-ellipse" />
              Label
            </div>
          </div>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>Border Type (테두리) - Medium - Round - 삭제 버튼:</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div className="chip border round">
              <i className="icon icon-ellipse" />
              Label
              <button aria-label="삭제" />
            </div>
            <div className="chip border round blue">
              <i className="icon icon-ellipse" />
              Label
              <button aria-label="삭제" />
            </div>
            <div className="chip border round green">
              <i className="icon icon-ellipse" />
              Label
              <button aria-label="삭제" />
            </div>
            <div className="chip border round orange">
              <i className="icon icon-ellipse" />
              Label
              <button aria-label="삭제" />
            </div>
            <div className="chip border round red">
              <i className="icon icon-ellipse" />
              Label
              <button aria-label="삭제" />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>CSS 클래스</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>클래스</th>
              <th>설명</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>.chip</code></td>
              <td>기본 Chip 클래스 (필수) - 단독 사용시 default theme + default type + md size</td>
            </tr>
            <tr>
              <td><code>.sm</code></td>
              <td>작은 크기 (선택)</td>
            </tr>
            <tr>
              <td><code>.md</code></td>
              <td>중간 크기 (선택, 기본값이므로 생략 가능)</td>
            </tr>
            <tr>
              <td><code>.blue</code></td>
              <td>파란색 테마 (선택)</td>
            </tr>
            <tr>
              <td><code>.green</code></td>
              <td>초록색 테마 (선택)</td>
            </tr>
            <tr>
              <td><code>.orange</code></td>
              <td>주황색 테마 (선택)</td>
            </tr>
            <tr>
              <td><code>.red</code></td>
              <td>빨간색 테마 (선택)</td>
            </tr>
            <tr>
              <td><code>.fill</code></td>
              <td>옅은 배경 타입 (선택)</td>
            </tr>
            <tr>
              <td><code>.border</code></td>
              <td>테두리 타입 (선택, 배경 투명)</td>
            </tr>
            <tr>
              <td><code>.round</code></td>
              <td>완전히 둥근 모서리 (선택, pill 형태)</td>
            </tr>
          </tbody>
        </table>
        <p className="text-muted">
          참고: theme과 type의 default 값은 .chip 클래스에 이미 포함되어 있으므로 별도의 클래스가 필요하지 않습니다.
        </p>
      </section>

      <section className={styles.section}>
        <h2>HTML 구조</h2>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>structure.html</div>
          <pre><code>{`<!-- 기본 (default theme, default type=진한 배경, md size, 약간 각진 모서리) -->
<div class="chip">
  <i class="icon icon-ellipse"></i>
  Label
</div>

<!-- 다른 테마 -->
<div class="chip blue">
  <i class="icon icon-ellipse"></i>
  Label
</div>

<!-- Fill 타입 (옅은 배경) -->
<div class="chip fill blue">
  <i class="icon icon-ellipse"></i>
  Label
</div>

<!-- Border 타입 (테두리만) -->
<div class="chip border blue">
  <i class="icon icon-ellipse"></i>
  Label
</div>

<!-- Round (완전히 둥근 모서리) -->
<div class="chip round blue">
  <i class="icon icon-ellipse"></i>
  Label
</div>

<!-- 삭제 버튼 포함 -->
<div class="chip blue">
  <i class="icon icon-ellipse"></i>
  Label
  <button aria-label="삭제"></button>
</div>

<!-- 모든 조합 -->
<div class="chip sm fill round red">
  <i class="icon icon-ellipse"></i>
  Label
  <button aria-label="삭제"></button>
</div>`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>React 컴포넌트</h2>
        <p>
          React 환경에서는 Chip 컴포넌트를 import하여 사용할 수 있습니다.
        </p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>기본 사용법:</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Chip theme="blue" icon="icon-ellipse">
              Label
            </Chip>
            <Chip theme="green" icon="icon-ellipse">
              Label
            </Chip>
            <Chip theme="orange" icon="icon-ellipse">
              Label
            </Chip>
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>basic.tsx</div>
          <pre><code>{`import Chip from '@/react/atom/chip';

function App() {
  return (
    <>
      <Chip theme="blue" icon="icon-ellipse">
        Label
      </Chip>
      <Chip theme="green" icon="icon-ellipse">
        Label
      </Chip>
      <Chip theme="orange" icon="icon-ellipse">
        Label
      </Chip>
    </>
  );
}`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>삭제 기능이 있는 태그 목록:</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {tags.map((tag) => (
              <Chip
                key={tag.id}
                theme="blue"
                round
                icon="icon-ellipse"
                onDelete={() => handleDelete(tag.id)}
              >
                {tag.label}
              </Chip>
            ))}
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>with-delete.tsx</div>
          <pre><code>{`import { useState } from 'react';
import Chip from '@/react/atom/chip';

function TagList() {
  const [tags, setTags] = useState([
    { id: 1, label: 'React' },
    { id: 2, label: 'TypeScript' },
    { id: 3, label: 'Next.js' },
  ]);

  const handleDelete = (id: number) => {
    setTags(tags.filter((tag) => tag.id !== id));
  };

  return (
    <>
      {tags.map((tag) => (
        <Chip
          key={tag.id}
          theme="blue"
          round
          icon="icon-ellipse"
          onDelete={() => handleDelete(tag.id)}
        >
          {tag.label}
        </Chip>
      ))}
    </>
  );
}`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>다양한 조합:</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Chip size="sm" theme="blue" icon="icon-user">
              Small
            </Chip>
            <Chip theme="green" type="fill" icon="icon-check">
              Fill Type
            </Chip>
            <Chip theme="orange" type="border" round>
              Border Round
            </Chip>
            <Chip theme="red" icon="icon-warning" onDelete={() => alert('삭제')}>
              With Delete
            </Chip>
          </div>
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>variants.tsx</div>
          <pre><code>{`<Chip size="sm" theme="blue" icon="icon-user">
  Small
</Chip>

<Chip theme="green" type="fill" icon="icon-check">
  Fill Type
</Chip>

<Chip theme="orange" type="border" round>
  Border Round
</Chip>

<Chip theme="red" icon="icon-warning" onDelete={() => alert('삭제')}>
  With Delete
</Chip>`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Props</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Prop</th>
              <th>Type</th>
              <th>Default</th>
              <th>설명</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>children</code></td>
              <td><code>React.ReactNode</code></td>
              <td>-</td>
              <td>Chip 내부에 표시될 내용 (필수)</td>
            </tr>
            <tr>
              <td><code>theme</code></td>
              <td><code>'default' | 'blue' | 'green' | 'orange' | 'yellow' | 'red'</code></td>
              <td><code>'default'</code></td>
              <td>색상 테마</td>
            </tr>
            <tr>
              <td><code>type</code></td>
              <td><code>'default' | 'fill' | 'border'</code></td>
              <td><code>'default'</code></td>
              <td>스타일 타입 (진한 배경 / 옅은 배경 / 테두리만)</td>
            </tr>
            <tr>
              <td><code>size</code></td>
              <td><code>'sm' | 'md'</code></td>
              <td><code>'md'</code></td>
              <td>크기</td>
            </tr>
            <tr>
              <td><code>round</code></td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
              <td>완전히 둥근 모서리 여부</td>
            </tr>
            <tr>
              <td><code>icon</code></td>
              <td><code>string</code></td>
              <td>-</td>
              <td>좌측 아이콘 클래스 (예: 'icon-ellipse')</td>
            </tr>
            <tr>
              <td><code>onDelete</code></td>
              <td><code>() =&gt; void</code></td>
              <td>-</td>
              <td>삭제 버튼 클릭 핸들러 (제공시 삭제 버튼 표시)</td>
            </tr>
            <tr>
              <td><code>className</code></td>
              <td><code>string</code></td>
              <td><code>''</code></td>
              <td>추가 CSS 클래스</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className={styles.section}>
        <h2>HTML 사용 예제</h2>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>example.html</div>
          <pre><code>{`<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="podo-ui.css">
</head>
<body>
  <div class="container">
    <!-- 태그 목록 -->
    <div class="chip round blue">
      <i class="icon icon-ellipse"></i>
      React
      <button aria-label="삭제"></button>
    </div>

    <div class="chip round blue">
      <i class="icon icon-ellipse"></i>
      TypeScript
      <button aria-label="삭제"></button>
    </div>

    <div class="chip round blue">
      <i class="icon icon-ellipse"></i>
      Next.js
      <button aria-label="삭제"></button>
    </div>
  </div>

  <script>
    // 삭제 기능 구현
    document.querySelectorAll('.chip button').forEach(button => {
      button.addEventListener('click', () => {
        button.closest('.chip').remove();
      });
    });
  </script>
</body>
</html>`}</code></pre>
        </div>
      </section>
    </>
  );
}
