import { useRef, useEffect, useState, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import { z } from 'zod';
import styles from './editor.module.scss';

interface Props {
  value: string;
  width?: string;
  height?: string;
  onChange: (content: string) => void;
  validator?: z.ZodType<unknown>;
  placeholder?: string;
}

const Editor = ({
  value = '',
  width = '100%',
  height = '400px',
  onChange,
  validator,
  placeholder = '내용을 입력하세요...',
}: Props) => {
  const [message, setMessage] = useState('');
  const [statusClass, setStatusClass] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const editorID = `editor-${uuid()}`;

  const validateHandler = (content: string) => {
    setMessage('');
    setStatusClass('');
    if (validator && content.length > 0) {
      try {
        validator.parse(content);
        setStatusClass('success');
      } catch (e) {
        if (e instanceof z.ZodError) {
          setMessage(e.errors[0].message);
          setStatusClass('danger');
        }
      }
    }
  };

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
      validateHandler(content);
    }
  }, [onChange]);

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const insertLink = () => {
    const url = prompt('링크 URL을 입력하세요:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  useEffect(() => {
    if (editorRef.current && value && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  return (
    <div className={`${styles.editor} ${statusClass}`} style={{ width }}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarGroup}>
          <button
            type="button"
            className={styles.toolbarButton}
            onClick={() => execCommand('undo')}
            title="실행 취소"
          >
            <i className="icon undo" />
          </button>
          <button
            type="button"
            className={styles.toolbarButton}
            onClick={() => execCommand('redo')}
            title="다시 실행"
          >
            <i className="icon redo" />
          </button>
        </div>

        <div className={styles.toolbarGroup}>
          <select
            className={styles.toolbarSelect}
            onChange={(e) => execCommand('formatBlock', e.target.value)}
            defaultValue=""
          >
            <option value="">텍스트</option>
            <option value="h1">제목 1</option>
            <option value="h2">제목 2</option>
            <option value="h3">제목 3</option>
            <option value="h4">제목 4</option>
            <option value="h5">제목 5</option>
            <option value="h6">제목 6</option>
            <option value="p">본문</option>
          </select>
        </div>

        <div className={styles.toolbarGroup}>
          <button
            type="button"
            className={styles.toolbarButton}
            onClick={() => execCommand('bold')}
            title="굵게"
          >
            <i className="icon bold" />
          </button>
          <button
            type="button"
            className={styles.toolbarButton}
            onClick={() => execCommand('italic')}
            title="기울임"
          >
            <i className="icon italic" />
          </button>
          <button
            type="button"
            className={styles.toolbarButton}
            onClick={() => execCommand('underline')}
            title="밑줄"
          >
            <i className="icon underline" />
          </button>
          <button
            type="button"
            className={styles.toolbarButton}
            onClick={() => execCommand('strikeThrough')}
            title="취소선"
          >
            <i className="icon strikethrough" />
          </button>
        </div>

        <div className={styles.toolbarGroup}>
          <button
            type="button"
            className={styles.toolbarButton}
            onClick={() => execCommand('justifyLeft')}
            title="왼쪽 정렬"
          >
            <i className="icon align-left" />
          </button>
          <button
            type="button"
            className={styles.toolbarButton}
            onClick={() => execCommand('justifyCenter')}
            title="가운데 정렬"
          >
            <i className="icon align-center" />
          </button>
          <button
            type="button"
            className={styles.toolbarButton}
            onClick={() => execCommand('justifyRight')}
            title="오른쪽 정렬"
          >
            <i className="icon align-right" />
          </button>
          <button
            type="button"
            className={styles.toolbarButton}
            onClick={() => execCommand('justifyFull')}
            title="양쪽 정렬"
          >
            <i className="icon align-justify" />
          </button>
        </div>

        <div className={styles.toolbarGroup}>
          <button
            type="button"
            className={styles.toolbarButton}
            onClick={() => execCommand('insertUnorderedList')}
            title="목록"
          >
            <i className="icon list-ul" />
          </button>
          <button
            type="button"
            className={styles.toolbarButton}
            onClick={() => execCommand('insertOrderedList')}
            title="번호 목록"
          >
            <i className="icon list-ol" />
          </button>
        </div>

        <div className={styles.toolbarGroup}>
          <button
            type="button"
            className={styles.toolbarButton}
            onClick={insertLink}
            title="링크"
          >
            <i className="icon link" />
          </button>
          <button
            type="button"
            className={styles.toolbarButton}
            onClick={() => execCommand('unlink')}
            title="링크 제거"
          >
            <i className="icon unlink" />
          </button>
        </div>

        <div className={styles.toolbarGroup}>
          <button
            type="button"
            className={styles.toolbarButton}
            onClick={() => execCommand('removeFormat')}
            title="서식 지우기"
          >
            <i className="icon eraser" />
          </button>
        </div>
      </div>

      <div
        ref={editorRef}
        id={editorID}
        className={styles.editorContent}
        contentEditable
        onInput={handleInput}
        style={{ height }}
        data-placeholder={placeholder}
      />

      {validator && message && (
        <div className={styles.validator}>{message}</div>
      )}
    </div>
  );
};

export default Editor;
