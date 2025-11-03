'use client';

import styles from './page.module.scss';
import { ToastProvider, useToast } from '../../../../react/molecule/toast-provider';

function ToastExamples() {
  const { showToast } = useToast();

  const examples = [
    {
      label: 'Type 01 - Success (Top Right)',
      onClick: () => {
        showToast({
          header: '성공',
          message: '파일이 성공적으로 업로드되었습니다!',
          variant: 'success',
          type: 'type01',
          position: 'top-right',
          duration: 3000,
        });
      },
    },
    {
      label: 'Type 02 - Info (Top Center)',
      onClick: () => {
        showToast({
          header: '알림',
          message: '새로운 메시지가 있습니다',
          variant: 'info',
          type: 'type02',
          position: 'top-center',
          duration: 3000,
        });
      },
    },
    {
      label: 'Type 01 Long - Warning (Bottom Right)',
      onClick: () => {
        showToast({
          message: '저장되지 않은 변경사항이 있습니다',
          variant: 'warning',
          type: 'type01',
          long: true,
          position: 'bottom-right',
          duration: 4000,
        });
      },
    },
    {
      label: 'Type 02 Long - Danger (Bottom Center)',
      onClick: () => {
        showToast({
          message: '오류가 발생했습니다',
          variant: 'danger',
          type: 'type02',
          long: true,
          position: 'bottom-center',
          duration: 3000,
        });
      },
    },
    {
      label: 'Primary - Center (수동 닫기)',
      onClick: () => {
        showToast({
          header: '중요 알림',
          message: '이 메시지는 닫기 버튼을 눌러야 닫힙니다',
          variant: 'primary',
          type: 'type01',
          position: 'center',
          duration: 0,
          width: 400,
        });
      },
    },
    {
      label: 'Custom Width - Bottom Left',
      onClick: () => {
        showToast({
          header: '넓은 토스트',
          message: '너비를 500px로 지정한 토스트입니다',
          variant: 'info',
          type: 'type02',
          position: 'bottom-left',
          duration: 3000,
          width: 500,
        });
      },
    },
  ];

  return (
    <div className={styles.examplesSection}>
      <div className={styles.examplesGrid}>
        {examples.map((example, index) => (
          <button
            key={index}
            className="primary"
            onClick={example.onClick}
          >
            {example.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Toast() {
  const variants = [
    { name: 'default', label: 'Default', description: '기본 알림' },
    { name: 'primary', label: 'Primary', description: '주요 알림' },
    { name: 'info', label: 'Info', description: '정보성 알림' },
    { name: 'success', label: 'Success', description: '성공 알림' },
    { name: 'warning', label: 'Warning', description: '경고 알림' },
    { name: 'danger', label: 'Danger', description: '위험 알림' },
  ];

  return (
    <ToastProvider>
      <>
        <section className={styles.section}>
          <h1>토스트</h1>
          <p>사용자에게 알림이나 피드백을 전달하는 Toast 컴포넌트입니다</p>
        </section>

      <section className={styles.section}>
        <h2>기본 사용법</h2>
        <p>
          토스트는 .toast 클래스를 사용하여 만들 수 있습니다.
          아이콘, 헤더, 본문, 닫기 버튼을 포함할 수 있습니다.
        </p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<div class="toast">
  <div class="toast-icon">
    <i class="icon-info"></i>
  </div>
  <div class="toast-content">
    <div class="toast-header">Header</div>
    <div class="toast-body">Lorem ipsum dolor sit amet</div>
  </div>
  <button class="toast-close">
    <i class="icon-close"></i>
  </button>
</div>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <div className="toast">
            <div className="toast-icon">
              <i className="icon-info"></i>
            </div>
            <div className="toast-content">
              <div className="toast-header">Header</div>
              <div className="toast-body">Lorem ipsum dolor sit amet</div>
            </div>
            <button className="toast-close">
              <i className="icon-close"></i>
            </button>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>스타일 타입</h2>
        <p>
          토스트는 두 가지 타입과 두 가지 레이아웃 스타일을 제공합니다:
        </p>

        <h3>타입</h3>
        <ul>
          <li><strong>Type 01 (기본)</strong>: 4px 두꺼운 강조 색상 테두리</li>
          <li><strong>Type 02 (.toast-border)</strong>: 1px 전체 외곽선만 (강조 색상 테두리 없음)</li>
        </ul>

        <h3>레이아웃</h3>
        <ul>
          <li><strong>기본 (long=false)</strong>: 세로 레이아웃, Type 01일 때 상단에 4px 강조 테두리</li>
          <li><strong>Long (.toast-long)</strong>: 가로 레이아웃, Type 01일 때 왼쪽에 4px 강조 테두리</li>
        </ul>

        <h3>Type 01 - 강조 색상 테두리</h3>
        <p>
          기본 스타일은 상단에 4px 두꺼운 강조 색상 테두리가 표시됩니다.
        </p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<!-- Type 01 (4px 강조 색상 테두리) -->
<div class="toast info">
  <div class="toast-icon">
    <i class="icon-info"></i>
  </div>
  <div class="toast-content">
    <div class="toast-header">Header</div>
    <div class="toast-body">Lorem ipsum dolor sit amet</div>
  </div>
  <button class="toast-close">
    <i class="icon-close"></i>
  </button>
</div>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <div className={styles.toastGroup}>
            <div className="toast info">
              <div className="toast-icon">
                <i className="icon-info"></i>
              </div>
              <div className="toast-content">
                <div className="toast-header">Header</div>
                <div className="toast-body">Lorem ipsum dolor sit amet</div>
              </div>
              <button className="toast-close">
                <i className="icon-close"></i>
              </button>
            </div>
          </div>
        </div>

        <h3>Type 02 - 전체 외곽선</h3>
        <p>
          .toast-border 클래스를 추가하면 1px 전체 외곽선만 표시됩니다 (강조 색상 테두리 없음).
        </p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<!-- Type 02 (1px 전체 외곽선만) -->
<div class="toast toast-border info">
  <div class="toast-icon">
    <i class="icon-info"></i>
  </div>
  <div class="toast-content">
    <div class="toast-header">Header</div>
    <div class="toast-body">Lorem ipsum dolor sit amet</div>
  </div>
  <button class="toast-close">
    <i class="icon-close"></i>
  </button>
</div>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <div className={styles.toastGroup}>
            <div className="toast toast-border info">
              <div className="toast-icon">
                <i className="icon-info"></i>
              </div>
              <div className="toast-content">
                <div className="toast-header">Header</div>
                <div className="toast-body">Lorem ipsum dolor sit amet</div>
              </div>
              <button className="toast-close">
                <i className="icon-close"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Long 스타일</h2>
        <p>
          .toast-long 클래스를 추가하면 가로 레이아웃으로 변경되며, 테두리 위치가 상단에서 왼쪽으로 바뀝니다.
          좁은 공간에 토스트를 표시할 때 유용합니다.
        </p>

        <h3>Type 01 + Long</h3>
        <p>
          왼쪽에 4px 두꺼운 강조 색상 테두리가 표시됩니다.
        </p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<!-- Type 01 + Long (왼쪽에 4px 강조 테두리) -->
<div class="toast toast-long info">
  <div class="toast-content">
    <div class="toast-icon">
      <i class="icon-info"></i>
    </div>
    <div class="toast-body">Lorem ipsum dolor sit amet</div>
  </div>
  <button class="toast-close">
    <i class="icon-close"></i>
  </button>
</div>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <div className={styles.toastGroup}>
            <div className="toast toast-long info">
              <div className="toast-content">
                <div className="toast-icon">
                  <i className="icon-info"></i>
                </div>
                <div className="toast-body">Lorem ipsum dolor sit amet</div>
              </div>
              <button className="toast-close">
                <i className="icon-close"></i>
              </button>
            </div>
          </div>
        </div>

        <h3>Type 02 + Long</h3>
        <p>
          1px 전체 외곽선만 표시됩니다 (강조 색상 테두리 없음).
        </p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<!-- Type 02 + Long (1px 전체 외곽선만) -->
<div class="toast toast-long toast-border success">
  <div class="toast-content">
    <div class="toast-icon">
      <i class="icon-check"></i>
    </div>
    <div class="toast-body">파일이 성공적으로 업로드되었습니다</div>
  </div>
  <button class="toast-close">
    <i class="icon-close"></i>
  </button>
</div>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <div className={styles.toastGroup}>
            <div className="toast toast-long toast-border success">
              <div className="toast-content">
                <div className="toast-icon">
                  <i className="icon-check"></i>
                </div>
                <div className="toast-body">파일이 성공적으로 업로드되었습니다</div>
              </div>
              <button className="toast-close">
                <i className="icon-close"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>색상 변형</h2>
        <p>6가지 색상 변형을 사용하여 다양한 메시지를 전달할 수 있습니다:</p>

        <div className={styles.variantsShowcase}>
          {variants.map((variant) => (
            <div key={variant.name} className={styles.variantCard}>
              <div className={styles.variantHeader}>
                <h3>{variant.label}</h3>
                <p>{variant.description}</p>
              </div>
              <div className={styles.variantExamples}>
                <div className={`toast ${variant.name}`}>
                  <div className="toast-icon">
                    <i className="icon-info"></i>
                  </div>
                  <div className="toast-content">
                    <div className="toast-header">{variant.label}</div>
                    <div className="toast-body">Type 01 (4px 강조 테두리)</div>
                  </div>
                  <button className="toast-close">
                    <i className="icon-close"></i>
                  </button>
                </div>
                <div className={`toast toast-border ${variant.name}`}>
                  <div className="toast-icon">
                    <i className="icon-info"></i>
                  </div>
                  <div className="toast-content">
                    <div className="toast-header">{variant.label}</div>
                    <div className="toast-body">Type 02 (1px 외곽선)</div>
                  </div>
                  <button className="toast-close">
                    <i className="icon-close"></i>
                  </button>
                </div>
                <div className={`toast toast-long ${variant.name}`}>
                  <div className="toast-content">
                    <div className="toast-icon">
                      <i className="icon-info"></i>
                    </div>
                    <div className="toast-body">Type 01 + Long (4px 강조)</div>
                  </div>
                  <button className="toast-close">
                    <i className="icon-close"></i>
                  </button>
                </div>
                <div className={`toast toast-long toast-border ${variant.name}`}>
                  <div className="toast-content">
                    <div className="toast-icon">
                      <i className="icon-info"></i>
                    </div>
                    <div className="toast-body">Type 02 + Long (1px 외곽선)</div>
                  </div>
                  <button className="toast-close">
                    <i className="icon-close"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<!-- Default -->
<div class="toast default">...</div>

<!-- Info -->
<div class="toast info">...</div>

<!-- Success -->
<div class="toast success">...</div>

<!-- Warning -->
<div class="toast warning">...</div>

<!-- Danger -->
<div class="toast danger">...</div>`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Long 스타일</h2>
        <p>
          .toast-long 클래스를 추가하면 가로 레이아웃으로 변경되며 한 줄로 표시됩니다.
          좁은 공간에 토스트를 표시할 때 유용합니다.
        </p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<div class="toast toast-long info">
  <div class="toast-content">
    <div class="toast-icon">
      <i class="icon-info"></i>
    </div>
    <div class="toast-body">Lorem ipsum dolor sit amet</div>
  </div>
  <button class="toast-close">
    <i class="icon-close"></i>
  </button>
</div>

<!-- Long + Border -->
<div class="toast toast-long toast-border success">
  <div class="toast-content">
    <div class="toast-icon">
      <i class="icon-check"></i>
    </div>
    <div class="toast-body">파일이 성공적으로 업로드되었습니다</div>
  </div>
  <button class="toast-close">
    <i class="icon-close"></i>
  </button>
</div>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <div className={styles.toastGroup}>
            <div className="toast toast-long info">
              <div className="toast-content">
                <div className="toast-icon">
                  <i className="icon-info"></i>
                </div>
                <div className="toast-body">Lorem ipsum dolor sit amet</div>
              </div>
              <button className="toast-close">
                <i className="icon-close"></i>
              </button>
            </div>
            <div className="toast toast-long toast-border success">
              <div className="toast-content">
                <div className="toast-icon">
                  <i className="icon-check"></i>
                </div>
                <div className="toast-body">파일이 성공적으로 업로드되었습니다</div>
              </div>
              <button className="toast-close">
                <i className="icon-close"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>간단한 메시지</h2>
        <p>헤더 없이 본문만 표시할 수도 있습니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<div class="toast info">
  <div class="toast-icon">
    <i class="icon-info"></i>
  </div>
  <div class="toast-content">
    <div class="toast-body">Lorem ipsum dolor sit amet</div>
  </div>
  <button class="toast-close">
    <i class="icon-close"></i>
  </button>
</div>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <div className={styles.toastGroup}>
            <div className="toast toast-border info">
              <div className="toast-icon">
                <i className="icon-info"></i>
              </div>
              <div className="toast-content">
                <div className="toast-body">Lorem ipsum dolor sit amet</div>
              </div>
              <button className="toast-close">
                <i className="icon-close"></i>
              </button>
            </div>
            <div className="toast success">
              <div className="toast-icon">
                <i className="icon-check"></i>
              </div>
              <div className="toast-content">
                <div className="toast-body">파일이 성공적으로 업로드되었습니다</div>
              </div>
              <button className="toast-close">
                <i className="icon-close"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>React 컴포넌트 예제</h2>
        <p>버튼을 클릭하여 다양한 Toast 스타일을 확인해보세요:</p>

        <ToastExamples />
      </section>

      <section className={styles.section}>
        <h2>React에서 사용하기</h2>
        <p>React 애플리케이션에서 Toast 컴포넌트를 사용할 수 있습니다.</p>

        <h3>1. ToastProvider 설정</h3>
        <p>먼저 애플리케이션의 최상위에 ToastProvider를 추가합니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>app/layout.tsx</div>
          <pre><code>{`import { ToastProvider } from 'podo-ui/react/molecule/toast-provider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}`}</code></pre>
        </div>

        <h3>2. useToast Hook 사용</h3>
        <p>컴포넌트에서 useToast hook을 사용하여 토스트를 표시합니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>component.tsx</div>
          <pre><code>{`import { useToast } from 'podo-ui/react/molecule/toast-provider';

function MyComponent() {
  const { showToast } = useToast();

  const handleClick = () => {
    showToast({
      message: '저장되었습니다!',
      header: '성공',
      variant: 'success',
      type: 'type01',
      position: 'top-right',
      duration: 3000,
    });
  };

  return <button onClick={handleClick}>저장</button>;
}`}</code></pre>
        </div>

        <h3>3. Toast 옵션</h3>
        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>TypeScript</div>
          <pre><code>{`interface ToastOptions {
  message: string;           // 필수: 토스트 메시지
  header?: string;           // 선택: 헤더 텍스트 (long일 때는 표시 안됨)
  variant?: 'default' | 'primary' | 'info' | 'success' | 'warning' | 'danger';
  type?: 'type01' | 'type02'; // type01: 강조 테두리, type02: 외곽선
  long?: boolean;            // true: 가로 레이아웃
  duration?: number;         // 자동 닫힘 시간(ms), 0이면 자동으로 닫히지 않음
  width?: string | number;   // 너비 (기본: auto)
  position?: 'top-left' | 'top-center' | 'top-right'
           | 'center-left' | 'center' | 'center-right'
           | 'bottom-left' | 'bottom-center' | 'bottom-right';
}`}</code></pre>
        </div>

        <h3>4. 사용 예제</h3>
        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>TypeScript</div>
          <pre><code>{`// Type 01 (강조 테두리)
showToast({
  message: '파일이 업로드되었습니다',
  variant: 'success',
  position: 'top-right',
});

// Type 02 (전체 외곽선)
showToast({
  header: '알림',
  message: '새로운 메시지가 있습니다',
  variant: 'info',
  type: 'type02',
  position: 'bottom-center',
});

// Long 스타일
showToast({
  message: '저장 완료',
  variant: 'success',
  long: true,
  position: 'bottom-right',
  duration: 2000,
});

// 너비 지정
showToast({
  message: '이것은 넓은 토스트입니다',
  width: 400,
  position: 'top-center',
});

// 자동으로 닫히지 않음
showToast({
  header: '중요 알림',
  message: '이 메시지는 수동으로 닫아야 합니다',
  variant: 'warning',
  duration: 0,
  position: 'center',
});`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>SCSS에서 사용하기</h2>
        <p>SCSS 모듈에서 토스트 스타일을 커스터마이징할 수 있습니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>component.module.scss</div>
          <pre><code>{`@use 'podo-ui/mixin' as *;

.customToast {
  display: flex;
  align-items: flex-start;
  gap: s(3);
  padding: s(4);
  border-radius: r(2);
  background-color: color('bg-elevation-1');
  border: 1px solid color('border');
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  .icon {
    color: color('info');
  }

  .content {
    flex: 1;
  }

  .header {
    font-weight: 600;
    color: color('text-body');
    margin-bottom: s(1);
  }

  .body {
    color: color('text-body');
  }

  .close {
    cursor: pointer;
    color: color('text-action');

    &:hover {
      color: color('text-action-hover');
    }
  }
}`}</code></pre>
        </div>
      </section>
      </>
    </ToastProvider>
  );
}
