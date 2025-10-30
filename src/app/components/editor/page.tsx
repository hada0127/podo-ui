'use client';

import { useState } from 'react';
import Editor from '../../../../react/atom/editor';
import styles from '../input/page.module.scss';

export default function EditorPage() {
  const [content, setContent] = useState('<p>에디터를 사용해보세요!</p>');

  return (
    <>
      <section className={styles.section}>
        <h1>에디터</h1>
        <p>Podo UI의 Editor 컴포넌트 (SunEditor 기반) 사용법을 안내합니다</p>
      </section>

      <section className={styles.section}>
        <h2>개요</h2>
        <p>
          Podo UI Editor는 SunEditor를 기반으로 한 리치 텍스트 에디터 컴포넌트입니다.
          React 환경에서 사용할 수 있으며, Podo UI 디자인 시스템과 통합되어 있습니다.
        </p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <Editor
            value={content}
            onChange={setContent}
            height="300px"
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2>React에서 사용하기</h2>
        <p>React 컴포넌트로 제공되며, 다양한 에디터 기능을 설정할 수 있습니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>component.tsx</div>
          <pre><code>{`import { Editor } from 'podo-ui/react';

export default function MyComponent() {
  const [content, setContent] = useState('');

  return (
    <Editor
      value={content}
      onChange={setContent}
      height="400px"
    />
  );
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>주요 기능</h2>
        <ul>
          <li>텍스트 서식 (굵게, 기울임, 밑줄, 취소선)</li>
          <li>폰트 색상 및 배경색</li>
          <li>정렬 및 목록</li>
          <li>표, 링크, 이미지, 비디오 삽입</li>
          <li>전체 화면 및 코드 보기</li>
          <li>실행 취소/다시 실행</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>SCSS 커스터마이징</h2>
        <p>에디터의 스타일은 SCSS 모듈을 통해 커스터마이징할 수 있습니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>component.module.scss</div>
          <pre><code>{`@use 'podo-ui/mixin' as *;

.editorWrapper {
  :global {
    .sun-editor {
      border: 1px solid color(border);
      border-radius: r(3);

      .se-toolbar {
        background: color(bg-elevation-1);
        border-bottom: 1px solid color(border);
      }

      .se-wrapper {
        background: color(bg-modal);
        color: color(default-deep-base);
      }

      button {
        &:hover {
          background-color: color(primary-fill);
        }
      }
    }
  }
}`}</code></pre>
        </div>
      </section>
    </>
  );
}
