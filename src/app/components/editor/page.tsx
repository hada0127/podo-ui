'use client';

import { useState } from 'react';
import Editor from '../../../../react/atom/editor';
import EditorView from '../../../../react/atom/editor-view';
import styles from '../input/page.module.scss';

export default function EditorPage() {
  const [content, setContent] = useState('');
  const [content2, setContent2] = useState('');
  const [content3, setContent3] = useState('');

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
          <Editor
            value={content}
            onChange={setContent}
            height="400px"
            placeholder="내용을 입력하세요..."
          />
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>미리보기 (EditorView):</div>
          <EditorView value={content} />
        </div>
      </section>

      <section className={styles.section}>
        <h2>React에서 사용하기</h2>
        <p>React 컴포넌트로 제공되며, 다양한 에디터 기능을 설정할 수 있습니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>component.tsx</div>
          <pre><code>{`import Editor from 'podo-ui/react/atom/editor';

export default function MyComponent() {
  const [content, setContent] = useState('');

  return (
    <Editor
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
          <li>유튜브 동영상 삽입</li>
          <li>HTML 코드 보기/편집</li>
          <li>서식 지우기</li>
          <li>실행 취소/다시 실행</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>높이 설정 옵션</h2>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>자동 높이 (height="contents"):</div>
          <Editor
            value={content2}
            onChange={setContent2}
            height="contents"
            minHeight="150px"
            maxHeight="500px"
            placeholder="내용에 따라 자동으로 높이가 조절됩니다..."
          />
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>자동 높이 예제</div>
          <pre><code>{`<Editor
  value={content}
  onChange={setContent}
  height="contents"
  minHeight="150px"
  maxHeight="500px"
  placeholder="내용에 따라 자동으로 높이가 조절됩니다..."
/>`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>크기 조절 가능 에디터</h2>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>리사이즈 가능 (resizable={true}):</div>
          <Editor
            value={content3}
            onChange={setContent3}
            height="300px"
            minHeight="200px"
            maxHeight="600px"
            resizable={true}
            placeholder="우측 하단을 드래그하여 크기를 조절할 수 있습니다..."
          />
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>리사이즈 예제</div>
          <pre><code>{`<Editor
  value={content}
  onChange={setContent}
  height="300px"
  minHeight="200px"
  maxHeight="600px"
  resizable={true}
  placeholder="우측 하단을 드래그하여 크기를 조절할 수 있습니다..."
/>`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Editor Props</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>속성</th>
              <th>타입</th>
              <th>기본값</th>
              <th>설명</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>value</td>
              <td>string</td>
              <td>''</td>
              <td>에디터의 HTML 내용</td>
            </tr>
            <tr>
              <td>onChange</td>
              <td>function</td>
              <td>-</td>
              <td>내용 변경 시 호출되는 콜백 함수</td>
            </tr>
            <tr>
              <td>height</td>
              <td>string | 'contents'</td>
              <td>'400px'</td>
              <td>에디터 높이 (px 단위 또는 'contents')</td>
            </tr>
            <tr>
              <td>minHeight</td>
              <td>string</td>
              <td>-</td>
              <td>최소 높이 (px 단위)</td>
            </tr>
            <tr>
              <td>maxHeight</td>
              <td>string</td>
              <td>-</td>
              <td>최대 높이 (px 단위)</td>
            </tr>
            <tr>
              <td>width</td>
              <td>string</td>
              <td>'100%'</td>
              <td>에디터 너비</td>
            </tr>
            <tr>
              <td>resizable</td>
              <td>boolean</td>
              <td>false</td>
              <td>크기 조절 가능 여부</td>
            </tr>
            <tr>
              <td>placeholder</td>
              <td>string</td>
              <td>'내용을 입력하세요...'</td>
              <td>빈 에디터에 표시될 플레이스홀더</td>
            </tr>
            <tr>
              <td>validator</td>
              <td>z.ZodType</td>
              <td>-</td>
              <td>Zod 검증 스키마</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className={styles.section}>
        <h2>EditorView (미리보기 컴포넌트)</h2>
        <p>
          EditorView는 Editor로 작성한 HTML 콘텐츠를 읽기 전용으로 표시하는 컴포넌트입니다.
          편집 기능 없이 순수하게 내용만 렌더링하며, 다크모드를 지원합니다.
        </p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>EditorView 사용 예제</div>
          <pre><code>{`import EditorView from 'podo-ui/react/atom/editor-view';

export default function MyComponent() {
  const htmlContent = '<h1>제목</h1><p>본문 내용</p>';

  return (
    <EditorView value={htmlContent} />
  );
}`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 미리보기 예제:</div>
          <div style={{
            padding: '20px',
            background: 'var(--bg-elevation)',
            borderRadius: '8px'
          }}>
            <EditorView value={content} />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>EditorView Props</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>속성</th>
              <th>타입</th>
              <th>기본값</th>
              <th>설명</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>value</td>
              <td>string</td>
              <td>''</td>
              <td>표시할 HTML 콘텐츠</td>
            </tr>
            <tr>
              <td>className</td>
              <td>string</td>
              <td>-</td>
              <td>추가 CSS 클래스</td>
            </tr>
          </tbody>
        </table>

        <h3>특징</h3>
        <ul>
          <li>Editor로 작성한 모든 서식 지원 (제목, 목록, 링크, 이미지 등)</li>
          <li>다크모드 자동 지원</li>
          <li>코드 블록 및 인라인 코드 스타일링</li>
          <li>반응형 이미지 및 유튜브 임베드</li>
          <li>편집 기능 없이 읽기 전용으로만 표시</li>
        </ul>
      </section>
    </>
  );
}