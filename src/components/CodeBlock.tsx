import { useState, useEffect } from 'react';
import styles from './CodeBlock.module.scss';
import { highlightCode } from '../utils/shiki';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export default function CodeBlock({ code, language = 'tsx', title }: CodeBlockProps) {
  const [highlightedHtml, setHighlightedHtml] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Syntax highlighting
  useEffect(() => {
    let mounted = true;

    highlightCode(code, language)
      .then((html) => {
        if (mounted) {
          setHighlightedHtml(html);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error('Syntax highlighting failed:', error);
        if (mounted) {
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [code, language]);

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  return (
    <div className={styles.codeBlock}>
      <div className={styles.codeHeader}>
        {title && <span className={styles.title}>{title}</span>}
        <button
          className={styles.copyButton}
          onClick={handleCopy}
          aria-label={copied ? 'Copied!' : 'Copy code'}
        >
          <i className={copied ? 'icon-check' : 'icon-copy'} />
        </button>
      </div>

      <div className={styles.codeContent}>
        {isLoading ? (
          <pre>
            <code>{code}</code>
          </pre>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
        )}
      </div>
    </div>
  );
}
