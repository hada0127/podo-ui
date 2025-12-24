import { useRef, useEffect, useState, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import { z } from 'zod';
import styles from '../editor.module.scss';

// Types
import type { EditorProps } from './types';

// Utils
import { getCleanHTML, formatHtml } from './utils';

// Constants
import { defaultToolbar, colorPalette, paragraphOptions, alignOptions } from './constants';

// Hooks
import { useSelectionManager } from './hooks/useSelectionManager';
import { useEditorHistory } from './hooks/useEditorHistory';
import { useCodeView } from './hooks/useCodeView';
import { useTextStyle } from './hooks/useTextStyle';
import { useLinkEditor } from './hooks/useLinkEditor';
import { useImageEditor } from './hooks/useImageEditor';
import { useYoutubeEditor } from './hooks/useYoutubeEditor';
import { useTableEditor } from './hooks/useTableEditor';

/**
 * WYSIWYG 에디터 컴포넌트
 *
 * 리치 텍스트 편집 기능을 제공하는 에디터입니다.
 * Undo/Redo, 문단 형식, 텍스트 스타일, 색상, 정렬, 링크, 이미지, 유튜브, 표 등을 지원합니다.
 *
 * @param {EditorProps} props - 에디터 설정
 * @returns {JSX.Element} 에디터 컴포넌트
 *
 * @example
 * ```tsx
 * const [content, setContent] = useState('');
 *
 * <Editor
 *   value={content}
 *   onChange={setContent}
 *   height="400px"
 *   toolbar={['undo-redo', 'text-style', 'link', 'image']}
 * />
 * ```
 */
const Editor = ({
  value = '',
  width = '100%',
  height = '400px',
  minHeight,
  maxHeight,
  resizable = false,
  onChange,
  validator,
  placeholder = '내용을 입력하세요...',
  toolbar,
}: EditorProps) => {
  // ========== State ==========
  const [message, setMessage] = useState('');
  const [statusClass, setStatusClass] = useState('');

  // ========== Refs ==========
  const editorRef = useRef<HTMLDivElement>(null);
  const codeEditorRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const paragraphButtonRef = useRef<HTMLDivElement>(null);
  const textColorButtonRef = useRef<HTMLDivElement>(null);
  const bgColorButtonRef = useRef<HTMLDivElement>(null);
  const alignButtonRef = useRef<HTMLDivElement>(null);
  const linkButtonRef = useRef<HTMLDivElement>(null);
  const imageButtonRef = useRef<HTMLDivElement>(null);
  const youtubeButtonRef = useRef<HTMLDivElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const tableButtonRef = useRef<HTMLDivElement>(null);
  const tableContextMenuRef = useRef<HTMLDivElement>(null);

  // IME 관련 refs
  const isComposingRef = useRef(false);
  const justComposedRef = useRef(false);

  // handleInput ref (순환 의존성 해결용)
  const handleInputRef = useRef<() => void>(() => {});

  // 클라이언트에서만 ID 생성
  const [editorID, setEditorID] = useState<string>('podo-editor');

  // ========== Hooks 초기화 ==========
  // Phase 2: 독립 모듈
  const selectionManager = useSelectionManager();

  const history = useEditorHistory({
    editorRef,
    onChange,
    getCleanHTML,
    initialValue: value,
  });

  const codeView = useCodeView({
    editorRef,
    codeEditorRef,
    value,
    onChange,
    formatHtml,
    getCleanHTML,
    height,
    onInput: () => handleInputRef.current(),
  });

  // Phase 3: 텍스트 스타일
  const textStyle = useTextStyle({
    editorRef,
    selectionManager,
    styles,
    onInput: () => handleInputRef.current(),
  });

  // Phase 4: 링크 편집
  const linkEditor = useLinkEditor({
    editorRef,
    selectionManager,
    onInput: () => handleInputRef.current(),
  });

  // Phase 5: 미디어
  const imageEditor = useImageEditor({
    editorRef,
    selectionManager,
    onInput: () => handleInputRef.current(),
    fileInputRef: imageFileInputRef,
  });

  const youtubeEditor = useYoutubeEditor({
    editorRef,
    selectionManager,
    onInput: () => handleInputRef.current(),
  });

  // Phase 6: 표
  const tableEditor = useTableEditor({
    editorRef,
    selectionManager,
    onInput: () => handleInputRef.current(),
    tableContextMenuRef,
  });

  // ========== Toolbar 설정 ==========
  const activeToolbar = toolbar || defaultToolbar;
  const isToolbarItemEnabled = (item: string) => activeToolbar.includes(item as any);

  // ========== Validation ==========
  const validateHandler = useCallback((content: string) => {
    if (!validator) {
      setMessage('');
      setStatusClass('');
      return;
    }

    try {
      validator.parse(content);
      setMessage('검증 성공');
      setStatusClass(styles.success);

      setTimeout(() => {
        setMessage('');
        setStatusClass('');
      }, 2000);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        setMessage(firstError.message);
        setStatusClass(styles.error);
      }
    }
  }, [validator]);

  // ========== handleInput 함수 정의 (모든 Hook 초기화 후) ==========
  const handleInput = useCallback(() => {
    // IME 입력 중에는 처리하지 않음
    if (isComposingRef.current) return;

    // compositionend 직후 input 이벤트는 무시
    if (justComposedRef.current) {
      justComposedRef.current = false;
      return;
    }

    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      const cleanContent = getCleanHTML(content);

      onChange(cleanContent);
      validateHandler(cleanContent);
      textStyle.detectCurrentParagraphStyle();
      textStyle.detectCurrentAlign();

      // 히스토리에 추가 (undo/redo 실행 중이 아닐 때만)
      if (!history.isUndoRedoRef.current) {
        history.addToHistory(content);
      }
    }
  }, [onChange, validateHandler, textStyle, history]);

  // handleInputRef 업데이트
  handleInputRef.current = handleInput;

  // ========== 드롭다운 관리 함수 ==========
  const closeAllDropdowns = useCallback(() => {
    // textStyle Hook의 드롭다운들
    textStyle.setIsParagraphDropdownOpen(false);
    textStyle.setIsTextColorOpen(false);
    textStyle.setIsBgColorOpen(false);
    textStyle.setIsAlignDropdownOpen(false);

    // linkEditor Hook의 드롭다운
    linkEditor.setIsLinkDropdownOpen(false);

    // imageEditor Hook의 드롭다운
    imageEditor.setIsImageDropdownOpen(false);

    // youtubeEditor Hook의 드롭다운
    youtubeEditor.setIsYoutubeDropdownOpen(false);

    // tableEditor Hook의 드롭다운
    tableEditor.setIsTableDropdownOpen(false);
  }, [textStyle, linkEditor, imageEditor, youtubeEditor, tableEditor]);

  // ========== IME 핸들러 ==========
  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback(() => {
    isComposingRef.current = false;
    justComposedRef.current = true;

    // 즉시 handleInput 호출
    setTimeout(() => {
      handleInput();
    }, 0);
  }, [handleInput]);

  // ========== 에디터 클릭 핸들러 ==========
  const handleEditorClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    // 드래그가 방금 끝난 경우 무시
    if (tableEditor.justFinishedDraggingRef.current) {
      return;
    }

    // 리사이즈 핸들 클릭은 무시
    if (target.classList.contains('resize-handle')) {
      return;
    }

    // 이미지/유튜브 편집 팝업 클릭은 무시
    if (target.closest(`.${styles.imageDropdown}`)) {
      return;
    }

    // 표 셀 외부를 클릭한 경우에만 선택 해제
    const clickedCell = target.closest('td') as HTMLTableCellElement;
    if (!clickedCell && tableEditor.selectedTableCells.length > 0) {
      tableEditor.clearCellSelection();
    }

    // 링크 클릭 처리
    const linkElement = target.closest('a') as HTMLAnchorElement;
    if (linkElement && editorRef.current?.contains(linkElement)) {
      e.preventDefault();
      linkEditor.handleLinkClick(linkElement);
      return;
    }

    // 이미지 클릭 처리
    const imageWrapper = target.closest('.image-wrapper') as HTMLElement;
    if (imageWrapper && editorRef.current?.contains(imageWrapper)) {
      e.preventDefault();
      const img = imageWrapper.querySelector('img') as HTMLImageElement;
      if (img) {
        imageEditor.handleImageClick(img);
      }
      return;
    }

    // 유튜브 클릭 처리 (오버레이 또는 컨테이너 클릭)
    if ((target.classList.contains('youtube-overlay') || target.closest('.youtube-container')) && editorRef.current?.contains(target)) {
      e.preventDefault();
      e.stopPropagation();

      const youtubeContainer = target.closest('.youtube-container') as HTMLElement;
      if (youtubeContainer) {
        youtubeEditor.handleYoutubeClick(youtubeContainer);
      }
      return;
    }

    // 기존 선택된 이미지/유튜브가 있으면 선택 해제
    if (youtubeEditor.selectedYoutube && !target.closest('.youtube-wrapper')) {
      youtubeEditor.unselectYoutube();
    }
    if (imageEditor.selectedImage && !target.closest('.image-wrapper')) {
      imageEditor.unselectImage();
    }

    // 일반 클릭 처리
    textStyle.detectCurrentParagraphStyle();
    textStyle.detectCurrentAlign();
  }, [tableEditor, linkEditor, imageEditor, youtubeEditor, textStyle, editorRef, styles]);

  // ========== 드래그&드롭 핸들러 ==========
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    // 이미지 파일만 처리
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          if (dataUrl) {
            if (editorRef.current) {
              editorRef.current.focus();
            }
            imageEditor.insertImageAtCursor(dataUrl, file.name || 'dropped-image');
          }
        };
        reader.readAsDataURL(file);
      }
    }
  }, [imageEditor]);

  // ========== 붙여넣기 핸들러 ==========
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    // 클립보드에서 이미지 확인 (items)
    const items = clipboardData.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const dataUrl = event.target?.result as string;
              if (dataUrl) {
                imageEditor.insertImageAtCursor(dataUrl, file.name || 'pasted-image');
              }
            };
            reader.readAsDataURL(file);
          }
          return;
        }
      }
    }

    // 파일로 붙여넣은 경우 (files)
    const files = clipboardData.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          e.preventDefault();
          const reader = new FileReader();
          reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            if (dataUrl) {
              imageEditor.insertImageAtCursor(dataUrl, file.name || 'pasted-image');
            }
          };
          reader.readAsDataURL(file);
          return;
        }
      }
    }

    // HTML/텍스트는 브라우저 기본 동작
  }, [imageEditor]);

  // ========== 추가 유틸 함수 ==========
  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  }, [handleInput]);

  const insertUnorderedList = () => execCommand('insertUnorderedList');
  const insertOrderedList = () => execCommand('insertOrderedList');
  const insertHorizontalRule = () => execCommand('insertHorizontalRule');

  const clearFormatting = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const fragment = range.cloneContents();
    const textContent = fragment.textContent || '';

    range.deleteContents();
    const textNode = document.createTextNode(textContent);
    range.insertNode(textNode);

    editorRef.current?.focus();
    handleInput();
  };

  // ========== 초기화 및 에디터 ID ==========
  useEffect(() => {
    setEditorID(`podo-editor-${uuid()}`);
  }, []);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // ========== 키보드 단축키 ==========
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo/Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        history.undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        history.redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        history.redo();
      }
      // Enter 키 처리
      else if (e.key === 'Enter') {
        const selection = window.getSelection();
        if (!selection || !editorRef.current) return;

        // 현재 커서가 목록 내부에 있는지 확인
        let node = selection.anchorNode;
        let inList = false;

        while (node && node !== editorRef.current) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (element.tagName === 'OL' || element.tagName === 'UL' || element.tagName === 'LI') {
              inList = true;
              break;
            }
          }
          node = node.parentNode;
        }

        // 목록 내부에서는 브라우저 기본 동작 사용 (새 <li> 생성)
        if (inList) {
          return;
        }

        e.preventDefault();

        if (e.shiftKey) {
          // Shift+Enter: <br> 삽입
          document.execCommand('insertLineBreak');
        } else {
          // Enter: <p> 태그로 새 문단 생성
          document.execCommand('formatBlock', false, 'p');
          document.execCommand('insertParagraph');
        }

        handleInput();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [history, handleInput]);

  // ========== 리사이즈 핸들러 ==========
  const handleResize = useCallback(() => {
    if (height === 'contents' && editorRef.current) {
      const newHeight = editorRef.current.scrollHeight;
      if (containerRef.current) {
        containerRef.current.style.height = `${newHeight}px`;
      }
    }
  }, [height]);

  useEffect(() => {
    handleResize();
  }, [value, handleResize]);

  // ========== 에디터 스타일 ==========
  const editorStyle: React.CSSProperties = {
    minHeight: codeView.isCodeView
      ? undefined
      : minHeight || (height === 'contents' ? '100px' : height),
    maxHeight: codeView.isCodeView ? undefined : maxHeight,
    height: codeView.isCodeView
      ? undefined
      : height === 'contents'
        ? `${codeView.savedEditorHeight || 100}px`
        : height,
  };

  const containerStyle: React.CSSProperties = {
    width,
    resize: resizable ? 'both' : 'none',
    overflow: resizable ? 'auto' : 'visible',
  };

  // ========== JSX 반환 ==========
  return (
    <div className={`${styles.editor} ${statusClass}`} style={{ width, position: 'relative' }}>
      {/* 툴바 */}
      <div className={styles.toolbar}>
        {/* Undo/Redo */}
        {isToolbarItemEnabled('undo-redo') && (
          <div className={styles.toolbarGroup}>
            <button
              type="button"
              className={styles.toolbarButton}
              onClick={history.undo}
              disabled={!history.canUndo}
              title="실행 취소"
              style={{
                opacity: !history.canUndo ? 0.65 : 1,
                backgroundColor: 'transparent',
                border: 'none',
                cursor: !history.canUndo ? 'not-allowed' : 'pointer'
              }}
            >
              <i className={styles.undo} />
            </button>
            <button
              type="button"
              className={styles.toolbarButton}
              onClick={history.redo}
              disabled={!history.canRedo}
              title="다시 실행"
              style={{
                opacity: !history.canRedo ? 0.65 : 1,
                backgroundColor: 'transparent',
                border: 'none',
                cursor: !history.canRedo ? 'not-allowed' : 'pointer'
              }}
            >
              <i className={styles.redo} />
            </button>
          </div>
        )}

        {/* 문단 형식 */}
        {isToolbarItemEnabled('paragraph') && (
          <div className={styles.toolbarGroup}>
            <button
              type="button"
              className={styles.paragraphButton}
              onClick={() => {
                closeAllDropdowns();
                textStyle.setIsParagraphDropdownOpen(!textStyle.isParagraphDropdownOpen);
              }}
              title="문단 형식"
            >
              <span>
                {paragraphOptions.find(opt => opt.value === textStyle.currentParagraphStyle)?.label || '문단 형식'}
              </span>
              <i className={styles.dropdownArrow} />
            </button>

            {textStyle.isParagraphDropdownOpen && (
              <div className={styles.paragraphDropdown}>
                {paragraphOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`${styles.paragraphOption} ${textStyle.currentParagraphStyle === option.value ? styles.active : ''}`}
                    onClick={() => textStyle.applyParagraphStyle(option.value)}
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
        )}

        {/* 텍스트 스타일 */}
        {isToolbarItemEnabled('text-style') && (
          <div className={styles.toolbarGroup}>
            <button
              type="button"
              className={styles.toolbarButton}
              onClick={textStyle.toggleBold}
              title="굵게"
            >
              <i className={styles.bold} />
            </button>
            <button
              type="button"
              className={styles.toolbarButton}
              onClick={textStyle.toggleItalic}
              title="기울임"
            >
              <i className={styles.italic} />
            </button>
            <button
              type="button"
              className={styles.toolbarButton}
              onClick={textStyle.toggleUnderline}
              title="밑줄"
            >
              <i className={styles.underline} />
            </button>
            <button
              type="button"
              className={styles.toolbarButton}
              onClick={textStyle.toggleStrikethrough}
              title="취소선"
            >
              <i className={styles.strikethrough} />
            </button>
          </div>
        )}

        {/* 색상 */}
        {isToolbarItemEnabled('color') && (
          <div className={styles.toolbarGroup}>
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className={styles.toolbarButton}
                onClick={() => {
                  const selection = window.getSelection();
                  if (selection && !selection.isCollapsed) {
                    selectionManager.saveSelection();
                    closeAllDropdowns();
                    textStyle.setIsTextColorOpen(!textStyle.isTextColorOpen);
                  }
                }}
                title="글꼴 색상"
              >
                <i className={styles.fontColor} />
              </button>
              {textStyle.isTextColorOpen && (
                <div className={styles.colorPalette}>
                  {colorPalette.map((row, rowIndex) => (
                    <div key={rowIndex} className={styles.colorRow}>
                      {row.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={styles.colorButton}
                          style={{ backgroundColor: color }}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            textStyle.applyTextColor(color);
                            textStyle.setIsTextColorOpen(false);
                          }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className={styles.toolbarButton}
                onClick={() => {
                  const selection = window.getSelection();
                  if (selection && !selection.isCollapsed) {
                    selectionManager.saveSelection();
                    closeAllDropdowns();
                    textStyle.setIsBgColorOpen(!textStyle.isBgColorOpen);
                  }
                }}
                title="배경 색상"
              >
                <i className={styles.highlight} />
              </button>
              {textStyle.isBgColorOpen && (
                <div className={styles.colorPalette}>
                  {colorPalette.map((row, rowIndex) => (
                    <div key={rowIndex} className={styles.colorRow}>
                      {row.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={styles.colorButton}
                          style={{ backgroundColor: color }}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            textStyle.applyBgColor(color);
                            textStyle.setIsBgColorOpen(false);
                          }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 정렬 */}
        {isToolbarItemEnabled('align') && (
          <div className={styles.toolbarGroup}>
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className={styles.toolbarButton}
                onClick={() => {
                  closeAllDropdowns();
                  textStyle.setIsAlignDropdownOpen(!textStyle.isAlignDropdownOpen);
                }}
                title={alignOptions.find(opt => opt.value === textStyle.currentAlign)?.label || '정렬'}
              >
                <i className={styles[alignOptions.find(opt => opt.value === textStyle.currentAlign)?.icon || 'alignLeft']} />
              </button>

              {textStyle.isAlignDropdownOpen && (
                <div className={styles.alignDropdown}>
                  {alignOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`${styles.alignOption} ${textStyle.currentAlign === option.value ? styles.active : ''}`}
                      onClick={() => textStyle.applyAlign(option.value)}
                      title={option.label}
                    >
                      <i className={styles[option.icon]} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 목록 */}
        {isToolbarItemEnabled('list') && (
          <div className={styles.toolbarGroup}>
            <button
              type="button"
              className={styles.toolbarButton}
              onClick={insertUnorderedList}
              title="목록"
            >
              <i className={styles.listUl} />
            </button>
            <button
              type="button"
              className={styles.toolbarButton}
              onClick={insertOrderedList}
              title="번호 목록"
            >
              <i className={styles.listOl} />
            </button>
          </div>
        )}

        {/* 구분선 */}
        {isToolbarItemEnabled('hr') && (
          <div className={styles.toolbarGroup}>
            <button
              type="button"
              className={styles.toolbarButton}
              onClick={insertHorizontalRule}
              title="구분선"
            >
              <i className={styles.hr} />
            </button>
          </div>
        )}

        {/* 표 */}
        {isToolbarItemEnabled('table') && (
          <div className={styles.toolbarGroup}>
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className={styles.toolbarButton}
                onClick={() => {
                  const selection = window.getSelection();
                  if (selection && selection.rangeCount > 0) {
                    selectionManager.saveSelection();
                  }
                  closeAllDropdowns();
                  tableEditor.setIsTableDropdownOpen(!tableEditor.isTableDropdownOpen);
                }}
                title="표 삽입"
              >
                <i className={styles.table} />
              </button>

              {tableEditor.isTableDropdownOpen && (
                <div className={styles.tableDropdown}>
                  <div className={styles.tableGridSelector}>
                    <div className={styles.tableGridLabel}>
                      {tableEditor.tableRows > 0 && tableEditor.tableCols > 0
                        ? `${tableEditor.tableRows} × ${tableEditor.tableCols} 표`
                        : '표 크기 선택'}
                    </div>
                    <div className={styles.tableGrid}>
                      {Array.from({ length: 10 }, (_, i) => i + 1).map(row => (
                        <div key={row} className={styles.tableGridRow}>
                          {Array.from({ length: 10 }, (_, j) => j + 1).map(col => (
                            <div
                              key={`${row}-${col}`}
                              className={`${styles.tableGridCell} ${
                                row <= tableEditor.tableRows && col <= tableEditor.tableCols ? styles.active : ''
                              }`}
                              onMouseEnter={() => {
                                tableEditor.setTableRows(row);
                                tableEditor.setTableCols(col);
                              }}
                              onClick={() => {
                                tableEditor.insertTable(row, col);
                              }}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 링크 */}
        {isToolbarItemEnabled('link') && (
          <div className={styles.toolbarGroup}>
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className={styles.toolbarButton}
                onClick={() => {
                  closeAllDropdowns();
                  linkEditor.openLinkDropdown();
                }}
                title="링크"
              >
                <i className={styles.link} />
              </button>

              {linkEditor.isLinkDropdownOpen && (
                <div className={styles.linkDropdown}>
                  <div className={styles.linkInput}>
                    <label>URL</label>
                    <input
                      type="text"
                      value={linkEditor.linkUrl}
                      onChange={(e) => linkEditor.setLinkUrl(e.target.value)}
                      placeholder="https://..."
                      autoFocus
                    />
                  </div>
                  <div className={styles.linkTarget}>
                    <label>
                      <input
                        type="radio"
                        value="_blank"
                        checked={linkEditor.linkTarget === '_blank'}
                        onChange={(e) => linkEditor.setLinkTarget(e.target.value)}
                      />
                      새 창에서 열기
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="_self"
                        checked={linkEditor.linkTarget === '_self'}
                        onChange={(e) => linkEditor.setLinkTarget(e.target.value)}
                      />
                      현재 창에서 열기
                    </label>
                  </div>
                  <div className={styles.linkActions}>
                    <button
                      type="button"
                      onClick={() => {
                        linkEditor.setIsLinkDropdownOpen(false);
                        linkEditor.setLinkUrl('');
                        linkEditor.setLinkTarget('_blank');
                      }}
                      className={styles.default}
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={linkEditor.insertLink}
                      disabled={!linkEditor.linkUrl}
                      className={styles.primary}
                    >
                      삽입
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 이미지 */}
        {isToolbarItemEnabled('image') && (
          <div className={styles.toolbarGroup}>
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className={styles.toolbarButton}
                onClick={() => {
                  closeAllDropdowns();
                  imageEditor.openImageDropdown();
                }}
                title="이미지"
              >
                <i className={styles.image} />
              </button>

              {imageEditor.isImageDropdownOpen && (
                <div className={styles.imageDropdown}>
                  <div className={styles.imageTabSection}>
                    <div className={styles.imageTabButtons}>
                      <button
                        type="button"
                        className={imageEditor.imageTabMode === 'file' ? styles.active : ''}
                        onClick={() => imageEditor.setImageTabMode('file')}
                      >
                        파일 업로드
                      </button>
                      <button
                        type="button"
                        className={imageEditor.imageTabMode === 'url' ? styles.active : ''}
                        onClick={() => imageEditor.setImageTabMode('url')}
                      >
                        URL 입력
                      </button>
                    </div>

                    {imageEditor.imageTabMode === 'file' && (
                      <div className={styles.imageFileSection}>
                        <button
                          type="button"
                          onClick={() => imageFileInputRef.current?.click()}
                          className={styles.fileSelectButton}
                        >
                          {imageEditor.imageFile ? imageEditor.imageFile.name : '파일 선택'}
                        </button>
                        {imageEditor.imagePreview && (
                          <div className={styles.imagePreviewBox}>
                            <img src={imageEditor.imagePreview} alt="Preview" />
                          </div>
                        )}
                      </div>
                    )}

                    {imageEditor.imageTabMode === 'url' && (
                      <div className={styles.imageUrlSection}>
                        <input
                          type="text"
                          value={imageEditor.imageUrl}
                          onChange={(e) => imageEditor.setImageUrl(e.target.value)}
                          placeholder="https://..."
                        />
                      </div>
                    )}
                  </div>

                  <div className={styles.imageOptions}>
                    <div className={styles.imageOptionRow}>
                      <label>크기</label>
                      <div className={styles.imageSizeButtons}>
                        <button type="button" className={imageEditor.imageWidth === '100%' ? styles.active : ''} onClick={() => imageEditor.setImageWidth('100%')}>100%</button>
                        <button type="button" className={imageEditor.imageWidth === '75%' ? styles.active : ''} onClick={() => imageEditor.setImageWidth('75%')}>75%</button>
                        <button type="button" className={imageEditor.imageWidth === '50%' ? styles.active : ''} onClick={() => imageEditor.setImageWidth('50%')}>50%</button>
                        <button type="button" className={imageEditor.imageWidth === 'original' ? styles.active : ''} onClick={() => imageEditor.setImageWidth('original')}>원본</button>
                      </div>
                    </div>

                    <div className={styles.imageOptionRow}>
                      <label>정렬</label>
                      <div className={styles.imageAlignButtons}>
                        <button type="button" className={imageEditor.imageAlign === 'left' ? styles.active : ''} onClick={() => imageEditor.setImageAlign('left')} title="왼쪽 정렬"><i className={styles.alignLeft} /></button>
                        <button type="button" className={imageEditor.imageAlign === 'center' ? styles.active : ''} onClick={() => imageEditor.setImageAlign('center')} title="가운데 정렬"><i className={styles.alignCenter} /></button>
                        <button type="button" className={imageEditor.imageAlign === 'right' ? styles.active : ''} onClick={() => imageEditor.setImageAlign('right')} title="오른쪽 정렬"><i className={styles.alignRight} /></button>
                      </div>
                    </div>

                    <div className={styles.imageOptionRow}>
                      <label>대체 텍스트</label>
                      <input type="text" value={imageEditor.imageAlt} onChange={(e) => imageEditor.setImageAlt(e.target.value)} placeholder="이미지 설명..." />
                    </div>
                  </div>

                  <div className={styles.imageActions}>
                    <button type="button" onClick={imageEditor.closeImageDropdown} className={styles.default}>취소</button>
                    <button type="button" onClick={imageEditor.insertImage} disabled={!imageEditor.imageUrl && !imageEditor.imageFile} className={styles.primary}>삽입</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 유튜브 */}
        {isToolbarItemEnabled('youtube') && (
          <div className={styles.toolbarGroup}>
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className={styles.toolbarButton}
                onClick={(e) => {
                  e.stopPropagation();
                  const selection = window.getSelection();
                  if (selection && selection.rangeCount > 0) {
                    selectionManager.saveSelection();
                  }
                  closeAllDropdowns();
                  youtubeEditor.setIsYoutubeDropdownOpen(true);
                }}
                title="유튜브"
              >
                <i className={styles.youtube} />
              </button>

              {youtubeEditor.isYoutubeDropdownOpen && (
                <div className={styles.imageDropdown}>
                  <div className={styles.imageTabSection}>
                    <div className={styles.imageTabButtons}>
                      <button type="button" className={styles.active} style={{ width: '100%' }}>유튜브 URL</button>
                    </div>

                    <div className={styles.imageUrlSection}>
                      <input
                        type="text"
                        value={youtubeEditor.youtubeUrl}
                        onChange={(e) => youtubeEditor.setYoutubeUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=... 또는 https://youtu.be/..."
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className={styles.imageOptions}>
                    <div className={styles.imageOptionRow}>
                      <label>크기</label>
                      <div className={styles.imageSizeButtons}>
                        <button type="button" className={youtubeEditor.youtubeWidth === '100%' ? styles.active : ''} onClick={() => youtubeEditor.setYoutubeWidth('100%')}>100%</button>
                        <button type="button" className={youtubeEditor.youtubeWidth === '75%' ? styles.active : ''} onClick={() => youtubeEditor.setYoutubeWidth('75%')}>75%</button>
                        <button type="button" className={youtubeEditor.youtubeWidth === '50%' ? styles.active : ''} onClick={() => youtubeEditor.setYoutubeWidth('50%')}>50%</button>
                        <button type="button" className={youtubeEditor.youtubeWidth === 'original' ? styles.active : ''} onClick={() => youtubeEditor.setYoutubeWidth('original')}>원본</button>
                      </div>
                    </div>

                    <div className={styles.imageOptionRow}>
                      <label>정렬</label>
                      <div className={styles.imageAlignButtons}>
                        <button type="button" className={youtubeEditor.youtubeAlign === 'left' ? styles.active : ''} onClick={() => youtubeEditor.setYoutubeAlign('left')} title="왼쪽 정렬"><i className={styles.alignLeft} /></button>
                        <button type="button" className={youtubeEditor.youtubeAlign === 'center' ? styles.active : ''} onClick={() => youtubeEditor.setYoutubeAlign('center')} title="가운데 정렬"><i className={styles.alignCenter} /></button>
                        <button type="button" className={youtubeEditor.youtubeAlign === 'right' ? styles.active : ''} onClick={() => youtubeEditor.setYoutubeAlign('right')} title="오른쪽 정렬"><i className={styles.alignRight} /></button>
                      </div>
                    </div>
                  </div>

                  <div className={styles.imageActions}>
                    <button type="button" onClick={youtubeEditor.closeYoutubeDropdown} className={styles.default}>취소</button>
                    <button type="button" onClick={youtubeEditor.insertYoutubeEmbed} disabled={!youtubeEditor.youtubeUrl} className={styles.primary}>삽입</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 서식 지우기 */}
        {isToolbarItemEnabled('format') && (
          <div className={styles.toolbarGroup}>
            <button
              type="button"
              className={styles.toolbarButton}
              onClick={clearFormatting}
              title="서식 지우기"
            >
              <i className={styles.eraser} />
            </button>
          </div>
        )}

        {/* 코드 보기 */}
        {isToolbarItemEnabled('code') && (
          <div className={styles.toolbarGroup}>
            <button
              type="button"
              className={`${styles.toolbarButton} ${codeView.isCodeView ? styles.active : ''}`}
              onClick={codeView.toggleCodeView}
              title={codeView.isCodeView ? "에디터로 전환" : "HTML 코드보기"}
            >
              <i className={styles.code} />
            </button>
          </div>
        )}
      </div>

      {/* 에디터 컨테이너 */}
      <div
        ref={containerRef}
        className={`${styles.editorContainer} ${resizable ? styles.resizable : ''}`}
        style={{
          height: height === 'contents' ? 'auto' : (height || '300px'),
          minHeight: minHeight || (height === 'contents' ? '100px' : '200px'),
          maxHeight: maxHeight || undefined,
          display: 'flex',
          flexDirection: 'column',
          resize: resizable ? 'vertical' : 'none',
          overflow: 'auto'
        }}
      >
        {codeView.isCodeView ? (
          /* 코드 보기 모드 */
          <textarea
            ref={codeEditorRef}
            className={styles.codeEditor}
            value={codeView.codeContent}
            onChange={codeView.handleCodeChange}
            spellCheck={false}
            style={{
              flex: height === 'contents' ? '0 0 auto' : 1,
              minHeight: height === 'contents' ? 'auto' : 0,
              height: height === 'contents' && codeView.savedEditorHeight ? `${codeView.savedEditorHeight}px` : undefined,
              resize: 'none'
            }}
            placeholder={placeholder}
          />
        ) : (
          /* 일반 에디터 모드 */
          <div
            ref={editorRef}
            id={editorID}
            className={styles.editorContent}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            onClick={handleEditorClick}
            onContextMenu={tableEditor.handleEditorContextMenu}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onPaste={handlePaste}
            onKeyUp={() => {
              textStyle.detectCurrentParagraphStyle();
              textStyle.detectCurrentAlign();
            }}
            style={{
              flex: height === 'contents' ? '0 0 auto' : 1,
              minHeight: height === 'contents' ? 'auto' : 0,
              overflowY: height === 'contents' ? 'visible' : 'auto'
            }}
            data-placeholder={placeholder}
          />
        )}
      </div>

      {/* 검증 메시지 */}
      {validator && message && (
        <div className={styles.validator}>{message}</div>
      )}

      {/* 링크 편집 팝업 */}
      {linkEditor.isEditLinkPopupOpen && linkEditor.selectedLinkElement && (
        <div
          className={styles.editLinkPopup}
          style={{
            position: 'absolute',
            top: linkEditor.selectedLinkElement.offsetTop + linkEditor.selectedLinkElement.offsetHeight + 5,
            left: linkEditor.selectedLinkElement.offsetLeft
          }}
        >
          <div className={styles.editLinkContent}>
            <div className={styles.editLinkInput}>
              <label>URL 수정</label>
              <input
                type="text"
                value={linkEditor.editLinkUrl}
                onChange={(e) => linkEditor.setEditLinkUrl(e.target.value)}
                placeholder="https://..."
                autoFocus
              />
            </div>
            <div className={styles.editLinkTarget}>
              <label>
                <input
                  type="radio"
                  value="_blank"
                  checked={linkEditor.editLinkTarget === '_blank'}
                  onChange={(e) => linkEditor.setEditLinkTarget(e.target.value)}
                />
                새 창에서 열기
              </label>
              <label>
                <input
                  type="radio"
                  value="_self"
                  checked={linkEditor.editLinkTarget === '_self'}
                  onChange={(e) => linkEditor.setEditLinkTarget(e.target.value)}
                />
                현재 창에서 열기
              </label>
            </div>
            <div className={styles.editLinkActions}>
              <button
                type="button"
                onClick={linkEditor.deleteLink}
                className={styles.danger}
              >
                링크 삭제
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={linkEditor.closeEditLinkPopup}
                  className={styles.default}
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={linkEditor.editLink}
                  disabled={!linkEditor.editLinkUrl}
                  className={styles.primary}
                >
                  적용
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 이미지 편집 팝업 */}
      {imageEditor.isImageEditPopupOpen && imageEditor.selectedImage && (() => {
        const img = imageEditor.selectedImage;
        const wrapper = img.closest('.image-wrapper') as HTMLElement;
        if (!wrapper) return null;

        const rect = wrapper.getBoundingClientRect();
        const editorRect = editorRef.current?.getBoundingClientRect();
        if (!editorRect) return null;

        return (
          <div
            className={styles.imageEditPopup}
            style={{
              position: 'absolute',
              top: rect.bottom - editorRect.top + 5,
              left: rect.left - editorRect.left
            }}
          >
            <div className={styles.imageEditContent}>
              <div className={styles.imageEditRow}>
                <label>크기</label>
                <div className={styles.imageSizeButtons}>
                  <button type="button" className={imageEditor.editImageWidth === '100%' ? styles.active : ''} onClick={() => imageEditor.setEditImageWidth('100%')}>100%</button>
                  <button type="button" className={imageEditor.editImageWidth === '75%' ? styles.active : ''} onClick={() => imageEditor.setEditImageWidth('75%')}>75%</button>
                  <button type="button" className={imageEditor.editImageWidth === '50%' ? styles.active : ''} onClick={() => imageEditor.setEditImageWidth('50%')}>50%</button>
                  <button type="button" className={imageEditor.editImageWidth === 'original' ? styles.active : ''} onClick={() => imageEditor.setEditImageWidth('original')}>원본</button>
                </div>
              </div>
              <div className={styles.imageEditRow}>
                <label>정렬</label>
                <div className={styles.imageAlignButtons}>
                  <button type="button" className={imageEditor.editImageAlign === 'left' ? styles.active : ''} onClick={() => imageEditor.setEditImageAlign('left')} title="왼쪽 정렬"><i className={styles.alignLeft} /></button>
                  <button type="button" className={imageEditor.editImageAlign === 'center' ? styles.active : ''} onClick={() => imageEditor.setEditImageAlign('center')} title="가운데 정렬"><i className={styles.alignCenter} /></button>
                  <button type="button" className={imageEditor.editImageAlign === 'right' ? styles.active : ''} onClick={() => imageEditor.setEditImageAlign('right')} title="오른쪽 정렬"><i className={styles.alignRight} /></button>
                </div>
              </div>
              <div className={styles.imageEditRow}>
                <label>대체 텍스트</label>
                <input type="text" value={imageEditor.editImageAlt} onChange={(e) => imageEditor.setEditImageAlt(e.target.value)} placeholder="이미지 설명..." />
              </div>
              <div className={styles.imageEditActions}>
                <button type="button" onClick={imageEditor.deleteImage} className={styles.danger}>이미지 삭제</button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={imageEditor.unselectImage} className={styles.default}>취소</button>
                  <button type="button" onClick={imageEditor.applyImageEdit} className={styles.primary}>적용</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 유튜브 편집 팝업 */}
      {youtubeEditor.isYoutubeEditPopupOpen && youtubeEditor.selectedYoutube && (() => {
        // 유튜브의 wrapper 찾기
        const youtubeWrapper = youtubeEditor.selectedYoutube.parentElement?.classList.contains('youtube-wrapper')
          ? youtubeEditor.selectedYoutube.parentElement
          : youtubeEditor.selectedYoutube;

        const wrapperRect = youtubeWrapper.getBoundingClientRect();
        const popupHeight = 300; // 대략적인 팝업 높이

        // 팝업이 화면 아래로 나가면 유튜브 위에 표시
        let topPosition = wrapperRect.bottom + 10;
        if (topPosition + popupHeight > window.innerHeight) {
          topPosition = Math.max(10, wrapperRect.top - popupHeight - 10);
        }

        return (
          <div
            className={styles.imageDropdown}
            style={{
              position: 'fixed',
              top: topPosition,
              left: Math.max(10, Math.min(
                wrapperRect.left + (wrapperRect.width / 2) - 180,
                window.innerWidth - 370
              )),
              zIndex: 9999,
              minWidth: '360px',
              maxWidth: '90%'
            }}
          >
            <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: '600' }}>유튜브 편집</h3>

            <div className={styles.imageOptions} style={{ marginBottom: '0' }}>
              <div className={styles.imageOptionRow}>
                <label>크기</label>
                <div className={styles.imageSizeButtons}>
                  <button
                    type="button"
                    onClick={() => youtubeEditor.setEditYoutubeWidth('100%')}
                    className={youtubeEditor.editYoutubeWidth === '100%' ? styles.active : ''}
                  >
                    100%
                  </button>
                  <button
                    type="button"
                    onClick={() => youtubeEditor.setEditYoutubeWidth('75%')}
                    className={youtubeEditor.editYoutubeWidth === '75%' ? styles.active : ''}
                  >
                    75%
                  </button>
                  <button
                    type="button"
                    onClick={() => youtubeEditor.setEditYoutubeWidth('50%')}
                    className={youtubeEditor.editYoutubeWidth === '50%' ? styles.active : ''}
                  >
                    50%
                  </button>
                  <button
                    type="button"
                    onClick={() => youtubeEditor.setEditYoutubeWidth('original')}
                    className={youtubeEditor.editYoutubeWidth === 'original' ? styles.active : ''}
                  >
                    원본
                  </button>
                </div>
              </div>

              <div className={styles.imageOptionRow}>
                <label>정렬</label>
                <div className={styles.imageAlignButtons}>
                  <button
                    type="button"
                    onClick={() => youtubeEditor.setEditYoutubeAlign('left')}
                    title="왼쪽 정렬"
                    className={youtubeEditor.editYoutubeAlign === 'left' ? styles.active : ''}
                  >
                    <i className={styles.alignLeft} />
                  </button>
                  <button
                    type="button"
                    onClick={() => youtubeEditor.setEditYoutubeAlign('center')}
                    title="가운데 정렬"
                    className={youtubeEditor.editYoutubeAlign === 'center' ? styles.active : ''}
                  >
                    <i className={styles.alignCenter} />
                  </button>
                  <button
                    type="button"
                    onClick={() => youtubeEditor.setEditYoutubeAlign('right')}
                    title="오른쪽 정렬"
                    className={youtubeEditor.editYoutubeAlign === 'right' ? styles.active : ''}
                  >
                    <i className={styles.alignRight} />
                  </button>
                </div>
              </div>

              <div className={styles.imageActions}>
                <button type="button" onClick={youtubeEditor.deleteYoutube} className={styles.danger}>삭제</button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={youtubeEditor.closeYoutubeEditPopup} className={styles.default}>취소</button>
                  <button type="button" onClick={youtubeEditor.applyYoutubeEdit} className={styles.primary}>적용</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 표 컨텍스트 메뉴 */}
      {tableEditor.isTableContextMenuOpen && tableEditor.selectedTableCell && (
        <div
          ref={tableContextMenuRef}
          className={styles.tableContextMenu}
          style={{
            position: 'fixed',
            top: tableEditor.tableContextMenuPosition.y,
            left: tableEditor.tableContextMenuPosition.x,
            zIndex: 10000
          }}
        >
          {tableEditor.selectedTableCells.length > 1 && (
            <div className={styles.tableContextMenuHeader}>
              {tableEditor.selectedTableCells.length}개 셀 선택됨
            </div>
          )}

          <div className={styles.tableContextMenuItem}>
            <button
              type="button"
              onClick={() => tableEditor.setIsTableCellColorOpen(!tableEditor.isTableCellColorOpen)}
              className={styles.tableContextMenuButton}
            >
              셀 배경색 {tableEditor.selectedTableCells.length > 1 ? `(${tableEditor.selectedTableCells.length}개)` : ''}
              <span className={styles.arrow}>{tableEditor.isTableCellColorOpen ? '▲' : '▼'}</span>
            </button>
            {tableEditor.isTableCellColorOpen && (
              <div className={styles.colorPaletteInline}>
                {colorPalette.map((row, rowIndex) => (
                  <div key={rowIndex} className={styles.colorRow}>
                    {row.map((color, colIndex) => (
                      <button
                        key={colIndex}
                        type="button"
                        className={styles.colorButton}
                        style={{ backgroundColor: color }}
                        onClick={() => tableEditor.changeTableCellBackgroundColor(color)}
                        title={color}
                      />
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={tableEditor.resetTableCellBackgroundColor}
            className={styles.tableContextMenuButton}
          >
            배경색 초기화
          </button>

          <div className={styles.tableContextMenuDivider} />

          <button
            type="button"
            onClick={() => tableEditor.changeTableCellAlign('left')}
            className={styles.tableContextMenuButton}
          >
            왼쪽 정렬
          </button>
          <button
            type="button"
            onClick={() => tableEditor.changeTableCellAlign('center')}
            className={styles.tableContextMenuButton}
          >
            가운데 정렬
          </button>
          <button
            type="button"
            onClick={() => tableEditor.changeTableCellAlign('right')}
            className={styles.tableContextMenuButton}
          >
            오른쪽 정렬
          </button>

          <div className={styles.tableContextMenuDivider} />

          <button
            type="button"
            onClick={() => tableEditor.addTableRow('above')}
            className={styles.tableContextMenuButton}
          >
            위에 행 추가
          </button>
          <button
            type="button"
            onClick={() => tableEditor.addTableRow('below')}
            className={styles.tableContextMenuButton}
          >
            아래에 행 추가
          </button>
          <button
            type="button"
            onClick={() => tableEditor.deleteTableRow()}
            className={styles.tableContextMenuButton}
          >
            행 삭제
          </button>

          <div className={styles.tableContextMenuDivider} />

          <button
            type="button"
            onClick={() => tableEditor.addTableColumn('left')}
            className={styles.tableContextMenuButton}
          >
            왼쪽에 열 추가
          </button>
          <button
            type="button"
            onClick={() => tableEditor.addTableColumn('right')}
            className={styles.tableContextMenuButton}
          >
            오른쪽에 열 추가
          </button>
          <button
            type="button"
            onClick={() => tableEditor.deleteTableColumn()}
            className={styles.tableContextMenuButton}
          >
            열 삭제
          </button>

          <div className={styles.tableContextMenuDivider} />

          <button
            type="button"
            onClick={tableEditor.deleteTable}
            className={`${styles.tableContextMenuButton} ${styles.danger}`}
          >
            표 삭제
          </button>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
      />
      <input
        ref={imageFileInputRef}
        type="file"
        accept="image/*"
        onChange={imageEditor.handleImageFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default Editor;
export type { EditorProps };
