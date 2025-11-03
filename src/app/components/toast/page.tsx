import styles from './page.module.scss';

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
  );
}
