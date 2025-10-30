'use client';

import Field from '../../../../react/molecule/field';
import styles from '../input/page.module.scss';

export default function FieldPage() {
  return (
    <>
      <section className={styles.section}>
        <h1>필드</h1>
        <p>Podo UI의 Field 컴포넌트 (레이블 + 입력 + 도움말) 사용법을 안내합니다</p>
      </section>

      <section className={styles.section}>
        <h2>개요</h2>
        <p>
          Field 컴포넌트는 레이블, 입력 요소, 도움말 텍스트를 하나로 묶은 React 컴포넌트입니다.
          폼 구성을 일관되고 쉽게 만들 수 있습니다.
        </p>

        <div className={styles.demo}>
          <div className={styles.demoTitle}>실제 예제:</div>
          <div className={styles.fieldGroup}>
            <Field label="이메일" helper="이메일 주소를 입력하세요">
              <input type="email" placeholder="example@email.com" />
            </Field>

            <Field label="비밀번호" helper="8자 이상 입력하세요">
              <input type="password" placeholder="••••••••" />
            </Field>

            <Field label="카테고리">
              <select>
                <option value="">선택하세요</option>
                <option value="1">옵션 1</option>
                <option value="2">옵션 2</option>
                <option value="3">옵션 3</option>
              </select>
            </Field>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>React에서 사용하기</h2>
        <p>Field 컴포넌트는 children으로 입력 요소를 받아 레이블과 함께 표시합니다:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>component.tsx</div>
          <pre><code>{`import { Field } from 'podo-ui/react';

export default function MyForm() {
  return (
    <div>
      <Field label="이메일" helper="이메일 주소를 입력하세요">
        <input type="email" placeholder="example@email.com" />
      </Field>

      <Field label="비밀번호" helper="8자 이상 입력하세요">
        <input type="password" placeholder="••••••••" />
      </Field>

      <Field label="설명" helper="최대 500자까지 입력 가능합니다">
        <textarea rows={4} placeholder="내용을 입력하세요"></textarea>
      </Field>

      <Field label="카테고리">
        <select>
          <option value="" disabled selected>선택하세요</option>
          <option value="1">옵션 1</option>
          <option value="2">옵션 2</option>
        </select>
      </Field>
    </div>
  );
}`}</code></pre>
        </div>
      </section>

      <section className={styles.section}>
        <h2>구조</h2>
        <p>Field 컴포넌트는 다음과 같은 구조로 이루어져 있습니다:</p>
        <ul>
          <li><strong>label:</strong> 입력 필드의 레이블 텍스트</li>
          <li><strong>children:</strong> 실제 입력 요소 (input, select, textarea 등)</li>
          <li><strong>helper:</strong> 입력 필드 아래에 표시되는 도움말 텍스트 (선택사항)</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>SCSS 스타일</h2>
        <p>Field 컴포넌트의 기본 스타일:</p>

        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>field.module.scss</div>
          <pre><code>{`@use 'podo-ui/mixin' as *;

.style {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: s(3);

  // 자식 요소 (input, select 등)
  > div.child {
    width: 100%;

    > :not(:last-child) {
      display: inline-block;
      margin-right: s(5);
    }
  }

  // 도움말 텍스트
  > div.helper {
    @include p4;
    color: color(text-sub);
  }
}`}</code></pre>
        </div>
      </section>
    </>
  );
}
