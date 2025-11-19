'use client';

import { useTranslations } from 'next-intl';
import styles from './page.module.scss';

export default function Toggle() {
  const t = useTranslations('toggle');
  return (
    <>
      <section className={styles.section}>
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
      </section>

      <section className={styles.section}>
        <h2>기본 사용법</h2>
        <p>
          <code>input[type="checkbox"]</code>에 <code>.toggle</code> 클래스를 추가하면
          스위치 형태의 토글로 변환됩니다.
        </p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>HTML</div>
          <pre><code>{`<label>
  <input type="checkbox" class="toggle" />
  토글 옵션
</label>

<label>
  <input type="checkbox" class="toggle" checked />
  켜진 상태
</label>

<label>
  <input type="checkbox" class="toggle" disabled />
  비활성화
</label>

<label>
  <input type="checkbox" class="toggle" checked disabled />
  켜짐 + 비활성화
</label>`}</code></pre>
        </div>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <div className={styles.toggleGroup}>
            <label>
              <input type="checkbox" className="toggle" />
              토글 옵션
            </label>
            <label>
              <input type="checkbox" className="toggle" defaultChecked />
              켜진 상태
            </label>
            <label>
              <input type="checkbox" className="toggle" disabled />
              비활성화
            </label>
            <label>
              <input type="checkbox" className="toggle" defaultChecked disabled />
              켜짐 + 비활성화
            </label>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>실제 사용 예제</h2>
        <p>토글 스위치는 설정 화면이나 on/off 상태를 표현할 때 유용합니다:</p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>알림 설정:</div>
          <div className={styles.settingsGroup}>
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <strong>이메일 알림</strong>
                <span>새로운 소식을 이메일로 받습니다</span>
              </div>
              <input type="checkbox" className="toggle" defaultChecked />
            </div>
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <strong>푸시 알림</strong>
                <span>앱 푸시 알림을 받습니다</span>
              </div>
              <input type="checkbox" className="toggle" />
            </div>
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <strong>SMS 알림</strong>
                <span>중요한 알림을 문자로 받습니다</span>
              </div>
              <input type="checkbox" className="toggle" defaultChecked />
            </div>
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <strong>마케팅 정보 수신</strong>
                <span>프로모션 및 이벤트 정보를 받습니다</span>
              </div>
              <input type="checkbox" className="toggle" />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>접근성</h2>
        <p>
          토글 스위치는 label로 감싸서 사용하면 레이블 클릭 시에도 토글이 작동합니다.
          키보드 포커스 시 outline이 표시되어 접근성이 보장됩니다.
        </p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>키보드로 Tab 키를 눌러 포커스를 이동해보세요:</div>
          <div className={styles.toggleGroup}>
            <label>
              <input type="checkbox" className="toggle" />
              포커스 가능한 토글 1
            </label>
            <label>
              <input type="checkbox" className="toggle" />
              포커스 가능한 토글 2
            </label>
            <label>
              <input type="checkbox" className="toggle" />
              포커스 가능한 토글 3
            </label>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>SCSS에서 사용하기</h2>
        <p>SCSS 모듈에서 토글 스타일을 커스터마이징할 수 있습니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>component.module.scss</div>
          <pre><code>{`@use 'podo-ui/mixin' as *;

.toggleWrapper {
  display: flex;
  align-items: center;
  gap: s(3);

  label {
    display: flex;
    align-items: center;
    gap: s(2);
    cursor: pointer;
    user-select: none;
  }
}

// 커스텀 토글 스타일
.toggle {
  appearance: none;
  position: relative;
  border-radius: r(full);
  width: 33px;
  height: 20px;
  background-color: color(bg-toggle);
  cursor: pointer;
  transition: 0.15s;

  &::before {
    content: '';
    position: absolute;
    left: 3px;
    top: 2px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: #ffffff;
    transition: 0.15s;
  }

  &:checked {
    background-color: color(info);

    &::before {
      left: auto;
      right: 3px;
    }
  }

  &:disabled {
    background-color: color(bg-disabled);
    cursor: not-allowed;

    &::before {
      background-color: color(bg-toggle);
    }
  }

  &:focus-visible:not(:disabled) {
    outline: 4px solid color(primary-outline);
  }
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>다크 모드</h2>
        <p>
          Podo UI는 토글 스위치에 대한 다크 모드를 자동으로 지원합니다.
          오른쪽 상단의 테마 토글 버튼으로 확인해보세요.
        </p>
      </section>
    </>
  );
}
