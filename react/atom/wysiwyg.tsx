import { useRef, useEffect, useState, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import { z } from 'zod';
import styles from './wysiwyg.module.scss';

interface Props {
  value: string;
  width?: string;
  height?: string;
  onChange: (content: string) => void;
  validator?: z.ZodType<unknown>;
  placeholder?: string;
}

const Wysiwyg = ({
  value = '',
  width = '100%',
  height = '400px',
  onChange,
  validator,
  placeholder = '내용을 입력하세요...',
}: Props) => {
  const [message, setMessage] = useState('');
  const [statusClass, setStatusClass] = useState('');
  const [currentParagraphStyle, setCurrentParagraphStyle] = useState('p');
  const [isParagraphDropdownOpen, setIsParagraphDropdownOpen] = useState(false);
  const [isTextColorOpen, setIsTextColorOpen] = useState(false);
  const [isBgColorOpen, setIsBgColorOpen] = useState(false);
  const [isAlignDropdownOpen, setIsAlignDropdownOpen] = useState(false);
  const [currentAlign, setCurrentAlign] = useState('left');
  const [activeStyles, setActiveStyles] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
  });
  const [savedSelection, setSavedSelection] = useState<Range | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const paragraphButtonRef = useRef<HTMLDivElement>(null);
  const textColorButtonRef = useRef<HTMLDivElement>(null);
  const bgColorButtonRef = useRef<HTMLDivElement>(null);
  const alignButtonRef = useRef<HTMLDivElement>(null);
  const editorID = `wysiwyg-${uuid()}`;

  // 색상 팔레트 정의
  const colorPalette = [
    // 첫 번째 줄: 기본 색상
    ['#000000', '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#ffffff'],
    // 두 번째 줄: 밝은 톤
    ['#808080', '#ff8080', '#ffff80', '#80ff80', '#80ffff', '#8080ff', '#ff80ff', '#c0c0c0'],
    // 세 번째 줄: 중간 톤
    ['#404040', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080', '#808080'],
    // 네 번째 줄: 어두운 톤
    ['#202020', '#400000', '#404000', '#004000', '#004040', '#000040', '#400040', '#404040'],
  ];

  // 정렬 옵션 정의
  const alignOptions = [
    { value: 'left', label: '왼쪽 정렬', icon: 'alignLeft' },
    { value: 'center', label: '가운데 정렬', icon: 'alignCenter' },
    { value: 'right', label: '오른쪽 정렬', icon: 'alignRight' },
  ];

  // 문단 형식 옵션 정의
  const paragraphOptions = [
    { value: 'h1', label: '제목 1' },
    { value: 'h2', label: '제목 2' },
    { value: 'h3', label: '제목 3' },
    { value: 'p', label: '본문', className: styles.pDefault },
    { value: 'p1', label: 'P1', className: styles.p1Preview },
    { value: 'p2', label: 'P2', className: styles.p2Preview },
    { value: 'p3', label: 'P3', className: styles.p3Preview },
    { value: 'p3_semibold', label: 'P3 Semibold', className: styles.p3_semiboldPreview },
    { value: 'p4', label: 'P4', className: styles.p4Preview },
    { value: 'p4_semibold', label: 'P4 Semibold', className: styles.p4_semiboldPreview },
    { value: 'p5', label: 'P5', className: styles.p5Preview },
    { value: 'p5_semibold', label: 'P5 Semibold', className: styles.p5_semiboldPreview },
  ];

  // 현재 선택된 스타일의 라벨 가져오기
  const getCurrentStyleLabel = () => {
    const option = paragraphOptions.find(opt => opt.value === currentParagraphStyle);
    return option ? option.label : '문단 형식';
  };

  // 현재 정렬 상태의 라벨 가져오기
  const getCurrentAlignLabel = () => {
    const option = alignOptions.find(opt => opt.value === currentAlign);
    return option ? option.label : '왼쪽 정렬';
  };

  // 현재 정렬 상태의 아이콘 가져오기
  const getCurrentAlignIcon = () => {
    const option = alignOptions.find(opt => opt.value === currentAlign);
    return option ? styles[option.icon] : styles.alignLeft;
  };

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

  const detectCurrentTextStyles = () => {
    setActiveStyles({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikeThrough: document.queryCommandState('strikeThrough'),
    });
  };

  const detectCurrentAlign = () => {
    // 정렬 상태 감지
    if (document.queryCommandState('justifyLeft')) {
      setCurrentAlign('left');
    } else if (document.queryCommandState('justifyCenter')) {
      setCurrentAlign('center');
    } else if (document.queryCommandState('justifyRight')) {
      setCurrentAlign('right');
    } else {
      // 기본값은 왼쪽 정렬
      setCurrentAlign('left');
    }
  };

  const detectCurrentParagraphStyle = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setCurrentParagraphStyle('p');
      return;
    }

    let container = selection.getRangeAt(0).commonAncestorContainer;
    if (container.nodeType === Node.TEXT_NODE) {
      container = container.parentNode as Element;
    }

    // 상위 블록 요소 찾기
    while (container && container !== editorRef.current) {
      const element = container as Element;
      if (element.tagName) {
        const tagName = element.tagName.toLowerCase();

        // H1, H2, H3 체크
        if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3') {
          setCurrentParagraphStyle(tagName);
          return;
        }

        // P 태그 체크
        if (tagName === 'p') {
          // 클래스 확인
          if (element.className) {
            // p1, p2, p3, p4, p5, p1_semibold, p2_semibold 등의 클래스 찾기
            const classNames = Object.keys(styles);
            for (const className of classNames) {
              if (className.match(/^p[1-5](_semibold)?$/) &&
                  element.classList.contains(styles[className])) {
                setCurrentParagraphStyle(className);
                return;
              }
            }
          }
          // 클래스가 없으면 일반 p
          setCurrentParagraphStyle('p');
          return;
        }

        // DIV나 기타 블록 요소는 본문으로 처리
        if (tagName === 'div' || tagName === 'blockquote' || tagName === 'pre') {
          setCurrentParagraphStyle('p');
          return;
        }
      }
      container = (container as Element).parentNode as Element;
    }

    // 기본값은 본문
    setCurrentParagraphStyle('p');
  };

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;

      onChange(content);
      validateHandler(content);
      detectCurrentParagraphStyle();
      detectCurrentTextStyles();
      detectCurrentAlign();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onChange]);

  const execCommand = (command: string, value: string | undefined = undefined) => {
    // bold, italic, underline, strikeThrough일 때 선택 영역이 없으면 아무것도 하지 않음
    if (['bold', 'italic', 'underline', 'strikeThrough'].includes(command)) {
      const selection = window.getSelection();
      if (selection && selection.isCollapsed) {
        // 선택 영역이 없으면 실행하지 않음
        return;
      }
    }

    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const applyParagraphStyle = (value: string) => {
    // 빈 값이면 본문으로 설정
    if (!value) {
      value = 'p';
    }

    // h1, h2, h3는 formatBlock 사용
    if (value === 'h1' || value === 'h2' || value === 'h3') {
      execCommand('formatBlock', value);
      setCurrentParagraphStyle(value);
    }
    // 본문은 p 태그로
    else if (value === 'p') {
      execCommand('formatBlock', 'p');
      setCurrentParagraphStyle('p');
    }
    // p1~p5 및 p1_semibold~p5_semibold 스타일은 클래스 적용
    else if (value.match(/^p[1-5](_semibold)?$/)) {
      // 먼저 p 태그로 만들고
      execCommand('formatBlock', 'p');

      // 잠시 후 클래스 적용
      setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        let container = selection.getRangeAt(0).commonAncestorContainer;
        if (container.nodeType === Node.TEXT_NODE) {
          container = container.parentNode as Element;
        }

        // 상위 블록 요소 찾기
        while (container && container !== editorRef.current) {
          const element = container as Element;
          if (element.tagName && ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DIV'].includes(element.tagName)) {
            // 클래스 적용
            element.className = styles[value];
            setCurrentParagraphStyle(value);
            break;
          }
          container = element.parentNode as Element;
        }
        handleInput();
      }, 10);
    }

    // 드롭다운 닫기
    setIsParagraphDropdownOpen(false);
  };

  const insertLink = () => {
    const url = prompt('링크 URL을 입력하세요:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertImage = () => {
    const choice = confirm('파일을 업로드하시겠습니까?\n확인: 파일 업로드\n취소: URL 입력');

    if (choice) {
      // 파일 업로드
      fileInputRef.current?.click();
    } else {
      // URL 입력
      const url = prompt('이미지 URL을 입력하세요:');
      if (url) {
        execCommand('insertImage', url);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        execCommand('insertImage', base64String);
      };
      reader.readAsDataURL(file);
    } else {
      alert('이미지 파일을 선택해주세요.');
    }
    // 같은 파일을 다시 선택할 수 있도록 초기화
    e.target.value = '';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // 에디터가 비어있고 처음 입력하는 경우
    if (editorRef.current && (!editorRef.current.innerHTML || editorRef.current.innerHTML === '<br>')) {
      // Enter, Backspace, Delete가 아닌 일반 문자 입력인 경우
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();

        // p 태그 생성 및 텍스트 삽입
        const p = document.createElement('p');
        p.textContent = e.key;
        editorRef.current.innerHTML = '';
        editorRef.current.appendChild(p);

        // 커서를 텍스트 끝으로 이동
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(p);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);

        handleInput();
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      // Enter만 눌렀을 때: p 태그로 새 문단 생성
      e.preventDefault();

      // insertParagraph를 사용하여 새 문단 생성
      document.execCommand('insertParagraph', false);

      // 새로 생성된 문단을 p 태그로 변환
      setTimeout(() => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          let container = range.commonAncestorContainer;

          // 텍스트 노드인 경우 부모 요소로
          if (container.nodeType === Node.TEXT_NODE) {
            container = container.parentElement as Node;
          }

          // div인 경우 p로 변경
          if (container && (container as HTMLElement).tagName === 'DIV') {
            document.execCommand('formatBlock', false, 'p');
          }
        }
        handleInput();
      }, 0);
    }
    // Shift+Enter는 브라우저 기본 동작 사용 (br 태그 삽입)
  };

  // 선택 영역 저장
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      return selection.getRangeAt(0);
    }
    return null;
  };

  // 선택 영역 복원
  const restoreSelection = (range: Range | null) => {
    if (range) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  };

  const applyColorStyle = (styleProperty: string, color: string, savedRange?: Range | null) => {
    // 저장된 선택 영역이 있으면 복원
    if (savedRange) {
      restoreSelection(savedRange);
    }

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      return;
    }

    const range = selection.getRangeAt(0);

    // 선택된 텍스트를 span으로 감싸기
    const span = document.createElement('span');

    try {
      const contents = range.extractContents();

      // 스타일 적용 - setAttribute를 사용하여 !important 포함
      if (styleProperty === 'color') {
        span.setAttribute('style', `color: ${color} !important;`);
      } else if (styleProperty === 'background-color') {
        span.setAttribute('style', `background-color: ${color} !important;`);
      }

      span.appendChild(contents);
      range.insertNode(span);

      // 커서 위치 조정
      range.selectNodeContents(span);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);

    } catch {
      // 폴백: execCommand 사용
      if (styleProperty === 'color') {
        document.execCommand('foreColor', false, color);
      } else {
        document.execCommand('hiliteColor', false, color);
      }
    }

    editorRef.current?.focus();
    handleInput();
  };

  const changeFontColor = (color: string, savedRange?: Range | null) => {
    applyColorStyle('color', color, savedRange);
  };

  const changeBackgroundColor = (color: string, savedRange?: Range | null) => {
    applyColorStyle('background-color', color, savedRange);
  };

  useEffect(() => {
    if (editorRef.current && value && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (paragraphButtonRef.current && !paragraphButtonRef.current.contains(target)) {
        setIsParagraphDropdownOpen(false);
      }

      if (textColorButtonRef.current && !textColorButtonRef.current.contains(target)) {
        setIsTextColorOpen(false);
      }

      if (bgColorButtonRef.current && !bgColorButtonRef.current.contains(target)) {
        setIsBgColorOpen(false);
      }

      if (alignButtonRef.current && !alignButtonRef.current.contains(target)) {
        setIsAlignDropdownOpen(false);
      }
    };

    if (isParagraphDropdownOpen || isTextColorOpen || isBgColorOpen || isAlignDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isParagraphDropdownOpen, isTextColorOpen, isBgColorOpen, isAlignDropdownOpen]);

  // 초기 로드 시 문단 형식 감지 (기본 p 태그는 추가하지 않음)
  useEffect(() => {
    // 약간의 지연을 주어 DOM이 완전히 렌더링된 후 감지
    const timer = setTimeout(() => {
      if (editorRef.current && editorRef.current.innerHTML) {
        // 내용이 있을 때만 문단 형식 감지
        detectCurrentParagraphStyle();
        detectCurrentTextStyles();
        detectCurrentAlign();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`${styles.wysiwyg} ${statusClass}`} style={{ width }}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarGroup}>
          <button
            type="button"
            className={styles.toolbarButton}
            onClick={() => execCommand('undo')}
            title="실행 취소"
          >
            <i className={styles.undo} />
          </button>
          <button
            type="button"
            className={styles.toolbarButton}
            onClick={() => execCommand('redo')}
            title="다시 실행"
          >
            <i className={styles.redo} />
          </button>
        </div>

        <div className={styles.toolbarGroup} ref={paragraphButtonRef}>
          <button
            type="button"
            className={styles.paragraphButton}
            onClick={() => {
              setIsParagraphDropdownOpen(!isParagraphDropdownOpen);
              setIsTextColorOpen(false);
              setIsBgColorOpen(false);
              setIsAlignDropdownOpen(false);
            }}
            title="문단 형식"
          >
            <span>{getCurrentStyleLabel()}</span>
            <i className={styles.dropdownArrow} />
          </button>

          {isParagraphDropdownOpen && (
            <div className={styles.paragraphDropdown}>
              {paragraphOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`${styles.paragraphOption} ${currentParagraphStyle === option.value ? styles.active : ''}`}
                  onClick={() => applyParagraphStyle(option.value)}
                >
                  {option.value === 'h1' ? (
                    <h1>{option.label}</h1>
                  ) : option.value === 'h2' ? (
                    <h2>{option.label}</h2>
                  ) : option.value === 'h3' ? (
                    <h3>{option.label}</h3>
                  ) : (
                    <span className={option.className || ''}>{option.label}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.toolbarGroup}>
          <button
            type="button"
            className={`${styles.toolbarButton} ${activeStyles.bold ? styles.active : ''}`}
            onClick={() => execCommand('bold')}
            title="굵게"
          >
            <i className={styles.bold} />
          </button>
          <button
            type="button"
            className={`${styles.toolbarButton} ${activeStyles.italic ? styles.active : ''}`}
            onClick={() => execCommand('italic')}
            title="기울임"
          >
            <i className={styles.italic} />
          </button>
          <button
            type="button"
            className={`${styles.toolbarButton} ${activeStyles.underline ? styles.active : ''}`}
            onClick={() => execCommand('underline')}
            title="밑줄"
          >
            <i className={styles.underline} />
          </button>
          <button
            type="button"
            className={`${styles.toolbarButton} ${activeStyles.strikeThrough ? styles.active : ''}`}
            onClick={() => execCommand('strikeThrough')}
            title="취소선"
          >
            <i className={styles.strikethrough} />
          </button>
        </div>

        <div className={styles.toolbarGroup}>
          <div ref={textColorButtonRef} style={{ position: 'relative' }}>
            <button
              type="button"
              className={styles.toolbarButton}
              onClick={() => {
                const selection = window.getSelection();
                if (selection && !selection.isCollapsed) {
                  // 선택 영역 저장
                  const range = saveSelection();
                  setSavedSelection(range);
                  setIsTextColorOpen(!isTextColorOpen);
                  setIsBgColorOpen(false);
                }
              }}
              title="글꼴 색상"
            >
              <i className={styles.fontColor} />
            </button>
            {isTextColorOpen && (
              <div className={styles.colorPalette}>
                {colorPalette.map((row, rowIndex) => (
                  <div key={rowIndex} className={styles.colorRow}>
                    {row.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={styles.colorButton}
                        style={{ backgroundColor: color }}
                        onMouseDown={(e) => e.preventDefault()} // 포커스 이동 방지
                        onClick={() => {
                          changeFontColor(color, savedSelection);
                          setIsTextColorOpen(false);
                          setSavedSelection(null);
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div ref={bgColorButtonRef} style={{ position: 'relative' }}>
            <button
              type="button"
              className={styles.toolbarButton}
              onClick={() => {
                const selection = window.getSelection();
                if (selection && !selection.isCollapsed) {
                  // 선택 영역 저장
                  const range = saveSelection();
                  setSavedSelection(range);
                  setIsBgColorOpen(!isBgColorOpen);
                  setIsTextColorOpen(false);
                }
              }}
              title="배경 색상"
            >
              <i className={styles.highlight} />
            </button>
            {isBgColorOpen && (
              <div className={styles.colorPalette}>
                {colorPalette.map((row, rowIndex) => (
                  <div key={rowIndex} className={styles.colorRow}>
                    {row.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={styles.colorButton}
                        style={{ backgroundColor: color }}
                        onMouseDown={(e) => e.preventDefault()} // 포커스 이동 방지
                        onClick={() => {
                          changeBackgroundColor(color, savedSelection);
                          setIsBgColorOpen(false);
                          setSavedSelection(null);
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.toolbarGroup}>
          <div ref={alignButtonRef} style={{ position: 'relative' }}>
            <button
              type="button"
              className={styles.toolbarButton}
              onClick={() => {
                setIsAlignDropdownOpen(!isAlignDropdownOpen);
                setIsParagraphDropdownOpen(false);
                setIsTextColorOpen(false);
                setIsBgColorOpen(false);
              }}
              title={getCurrentAlignLabel()}
            >
              <i className={getCurrentAlignIcon()} />
            </button>

            {isAlignDropdownOpen && (
              <div className={styles.alignDropdown}>
                {alignOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`${styles.alignOption} ${currentAlign === option.value ? styles.active : ''}`}
                    onClick={() => {
                      if (option.value === 'left') {
                        execCommand('justifyLeft');
                      } else if (option.value === 'center') {
                        execCommand('justifyCenter');
                      } else if (option.value === 'right') {
                        execCommand('justifyRight');
                      }
                      setCurrentAlign(option.value);
                      setIsAlignDropdownOpen(false);
                    }}
                    title={option.label}
                  >
                    <i className={styles[option.icon]} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.toolbarGroup}>
          <button
            type="button"
            className={styles.toolbarButton}
            onClick={() => execCommand('insertUnorderedList')}
            title="목록"
          >
            <i className={styles.listUl} />
          </button>
          <button
            type="button"
            className={styles.toolbarButton}
            onClick={() => execCommand('insertOrderedList')}
            title="번호 목록"
          >
            <i className={styles.listOl} />
          </button>
        </div>

        <div className={styles.toolbarGroup}>
          <button
            type="button"
            className={styles.toolbarButton}
            onClick={insertLink}
            title="링크"
          >
            <i className={styles.link} />
          </button>
          <button
            type="button"
            className={styles.toolbarButton}
            onClick={() => execCommand('unlink')}
            title="링크 제거"
          >
            <i className={styles.unlink} />
          </button>
          <button
            type="button"
            className={styles.toolbarButton}
            onClick={insertImage}
            title="이미지"
          >
            <i className={styles.image} />
          </button>
        </div>

        <div className={styles.toolbarGroup}>
          <button
            type="button"
            className={styles.toolbarButton}
            onClick={() => execCommand('removeFormat')}
            title="서식 지우기"
          >
            <i className={styles.eraser} />
          </button>
        </div>
      </div>

      <div
        ref={editorRef}
        id={editorID}
        className={styles.editor}
        contentEditable
        onInput={handleInput}
        onClick={() => {
          detectCurrentParagraphStyle();
          detectCurrentTextStyles();
          detectCurrentAlign();
        }}
        onKeyUp={() => {
          detectCurrentParagraphStyle();
          detectCurrentTextStyles();
          detectCurrentAlign();
        }}
        onKeyDown={handleKeyDown}
        style={{ height }}
        data-placeholder={placeholder}
      />

      {validator && message && (
        <div className={styles.validator}>{message}</div>
      )}

      {/* 숨겨진 파일 입력 필드 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default Wysiwyg;
