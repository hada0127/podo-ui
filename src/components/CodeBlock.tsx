import styles from './CodeBlock.module.scss';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export default function CodeBlock({ code, language = 'tsx', title }: CodeBlockProps) {
  return (
    <div className={styles.codeBlock}>
      {title && <div className={styles.codeHeader}>{title}</div>}
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}
