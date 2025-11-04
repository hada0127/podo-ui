'use client';

import { useState } from 'react';
import Wysiwyg from '../../../../react/atom/wysiwyg';
import styles from '../input/page.module.scss';

export default function WysiwygPage() {
  const [content, setContent] = useState('');

  return (
    <>
      <section className={styles.section}>
        <h1>에디터</h1>
        <p>Podo UI의 에디터 컴포넌트와 사용법을 안내합니다.</p>
      </section>

      <section className={styles.section}>
        <h2>개요</h2>
        <p>
          React 환경에서 사용할 수 있으며, Podo UI 디자인 시스템과 통합되어 있습니다.
        </p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <Wysiwyg
            value={content}
            onChange={setContent}
            height="400px"
            placeholder="내용을 입력하세요..."
          />
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>HTML 출력:</div>
          <pre style={{
            background: '#f5f5f5',
            padding: '16px',
            borderRadius: '4px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all'
          }}>
            {content}
          </pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>React에서 사용하기</h2>
        <p>React 컴포넌트로 제공되며, 다양한 에디터 기능을 설정할 수 있습니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>component.tsx</div>
          <pre><code>{`import Wysiwyg from 'podo-ui/react/atom/wysiwyg';

export default function MyComponent() {
  const [content, setContent] = useState('');

  return (
    <Wysiwyg
      value={content}
      onChange={setContent}
      height="400px"
      placeholder="내용을 입력하세요..."
    />
  );
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>주요 기능</h2>
        <ul>
          <li>텍스트 서식 (굵게, 기울임, 밑줄, 취소선)</li>
          <li>폰트 및 크기 설정</li>
          <li>단락 형식 (제목 1-6, 본문, 인용, 서식있는 텍스트)</li>
          <li>글꼴 색상 및 배경색</li>
          <li>정렬 (왼쪽, 가운데, 오른쪽, 양쪽)</li>
          <li>목록 (순서 없는 목록, 순서 있는 목록)</li>
          <li>링크 및 이미지 삽입</li>
          <li>서식 지우기</li>
          <li>실행 취소/다시 실행</li>
        </ul>
      </section>
    </>
  );
}