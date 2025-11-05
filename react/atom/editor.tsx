import { useRef, useEffect, useState, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import { z } from 'zod';
import styles from './editor.module.scss';

export interface EditorProps {
  value: string;
  width?: string;
  height?: string | 'contents';
  minHeight?: string;
  maxHeight?: string;
  resizable?: boolean;
  onChange: (content: string) => void;
  validator?: z.ZodType<unknown>;
  placeholder?: string;
}

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
}: EditorProps) => {
  const [message, setMessage] = useState('');
  const [statusClass, setStatusClass] = useState('');
  const [currentParagraphStyle, setCurrentParagraphStyle] = useState('p');
  const [isParagraphDropdownOpen, setIsParagraphDropdownOpen] = useState(false);
  const [isTextColorOpen, setIsTextColorOpen] = useState(false);
  const [isBgColorOpen, setIsBgColorOpen] = useState(false);
  const [isAlignDropdownOpen, setIsAlignDropdownOpen] = useState(false);
  const [currentAlign, setCurrentAlign] = useState('left');
  const [isLinkDropdownOpen, setIsLinkDropdownOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTarget, setLinkTarget] = useState('_blank');
  const [isEditLinkPopupOpen, setIsEditLinkPopupOpen] = useState(false);
  const [selectedLinkElement, setSelectedLinkElement] = useState<HTMLAnchorElement | null>(null);
  const [editLinkUrl, setEditLinkUrl] = useState('');
  const [editLinkTarget, setEditLinkTarget] = useState('_self');
  const [savedSelection, setSavedSelection] = useState<Range | null>(null);
  const [isImageDropdownOpen, setIsImageDropdownOpen] = useState(false);
  const [imageTabMode, setImageTabMode] = useState<'file' | 'url'>('file'); // 탭 모드 추가
  const [imageUrl, setImageUrl] = useState('');
  const [imageWidth, setImageWidth] = useState('original'); // 기본값을 원본으로 변경
  const [imageAlign, setImageAlign] = useState('left'); // 기본값을 좌측으로 변경
  const [imageAlt, setImageAlt] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [savedImageSelection, setSavedImageSelection] = useState<Range | null>(null); // 이미지 삽입용 선택 영역 저장
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null); // 선택된 이미지
  const [isImageEditPopupOpen, setIsImageEditPopupOpen] = useState(false); // 이미지 편집 팝업 상태
  const [editImageWidth, setEditImageWidth] = useState(''); // 편집 중인 이미지 크기
  const [editImageAlign, setEditImageAlign] = useState('left'); // 편집 중인 이미지 정렬
  const [editImageAlt, setEditImageAlt] = useState(''); // 편집 중인 이미지 대체 텍스트
  const [isResizing, setIsResizing] = useState(false); // 리사이즈 중 여부
  const [resizeStartData, setResizeStartData] = useState<{ startX: number; startY: number; startWidth: number; startHeight: number; handle: string } | null>(null);

  // 유튜브 관련 상태
  const [isYoutubeDropdownOpen, setIsYoutubeDropdownOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [savedYoutubeSelection, setSavedYoutubeSelection] = useState<Range | null>(null);
  const [youtubeWidth, setYoutubeWidth] = useState('100%'); // 기본값 100%
  const [youtubeAlign, setYoutubeAlign] = useState('center'); // 기본값 가운데
  const [selectedYoutube, setSelectedYoutube] = useState<HTMLElement | null>(null); // 선택된 유튜브
  const [isYoutubeEditPopupOpen, setIsYoutubeEditPopupOpen] = useState(false); // 유튜브 편집 팝업
  const [editYoutubeWidth, setEditYoutubeWidth] = useState('100%'); // 편집 중인 유튜브 크기
  const [editYoutubeAlign, setEditYoutubeAlign] = useState('center'); // 편집 중인 유튜브 정렬
  const [isCodeView, setIsCodeView] = useState(false); // 코드보기 모드
  const [codeContent, setCodeContent] = useState(''); // 코드보기 내용
  const [savedEditorHeight, setSavedEditorHeight] = useState<number | null>(null); // 위지윅 에디터 높이 저장

  // Undo/Redo 히스토리 관리
  const [history, setHistory] = useState<string[]>([value]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const historyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const historyRef = useRef<string[]>([value]);
  const historyIndexRef = useRef(0);
  const isUndoRedoRef = useRef(false); // undo/redo 실행 중 플래그
  const isComposingRef = useRef(false); // IME 입력 중 플래그
  const justComposedRef = useRef(false); // compositionend 직후 플래그

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
  // 클라이언트에서만 ID 생성 (Vite React용)
  const [editorID, setEditorID] = useState<string>('podo-editor');

  // 색상 팔레트 정의 (이미지 기반)
  const colorPalette = [
    // 첫 번째 줄: 순수 색상
    ['#ff0000', '#ff8000', '#ffff00', '#80ff00', '#00ffff', '#0080ff', '#0000ff', '#8000ff', '#ff00ff', '#000000'],
    // 두 번째 줄: 매우 밝은 톤 (90% 밝기)
    ['#ffcccc', '#ffe0cc', '#ffffcc', '#e0ffcc', '#ccffff', '#cce0ff', '#ccccff', '#e0ccff', '#ffccff', '#cccccc'],
    // 세 번째 줄: 밝은 톤 (70% 밝기)
    ['#ff9999', '#ffcc99', '#ffff99', '#ccff99', '#99ffff', '#99ccff', '#9999ff', '#cc99ff', '#ff99ff', '#999999'],
    // 네 번째 줄: 중간 톤 (50% 밝기)
    ['#ff6666', '#ffb366', '#ffff66', '#b3ff66', '#66ffff', '#66b3ff', '#6666ff', '#b366ff', '#ff66ff', '#666666'],
    // 다섯 번째 줄: 어두운 톤 (30% 밝기)
    ['#cc0000', '#cc6600', '#cccc00', '#66cc00', '#00cccc', '#0066cc', '#0000cc', '#6600cc', '#cc00cc', '#333333'],
    // 여섯 번째 줄: 매우 어두운 톤 (15% 밝기)
    ['#800000', '#804000', '#808000', '#408000', '#008080', '#004080', '#000080', '#400080', '#800080', '#1a1a1a'],
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

  // ref와 state 동기화
  useEffect(() => {
    historyRef.current = history;
    historyIndexRef.current = historyIndex;
  }, [history, historyIndex]);

  // 히스토리에 추가 (디바운스 적용)
  const addToHistory = useCallback((content: string) => {
    // 기존 타이머 취소
    if (historyTimerRef.current) {
      clearTimeout(historyTimerRef.current);
    }

    // 500ms 후에 히스토리 추가 (연속 입력 시 하나로 묶음)
    historyTimerRef.current = setTimeout(() => {
      // ref에서 최신 값 가져오기
      const currentHistory = historyRef.current;
      const currentIndex = historyIndexRef.current;

      // 현재 인덱스 이후의 히스토리 제거
      const newHistory = currentHistory.slice(0, currentIndex + 1);

      // 마지막 항목과 동일하면 추가하지 않음
      if (newHistory[newHistory.length - 1] === content) {
        return;
      }

      // 새 항목 추가 (최대 200개)
      const updated = [...newHistory, content];
      if (updated.length > 200) {
        updated.shift(); // 가장 오래된 항목 제거
        setHistory(updated);
        setHistoryIndex(currentIndex); // 인덱스는 그대로 유지
      } else {
        setHistory(updated);
        setHistoryIndex(updated.length - 1);
      }
    }, 500);
  }, []);

  // Undo 실행
  const performUndo = useCallback(() => {
    // debounce 타이머 취소 (undo 중에는 히스토리 추가 안 함)
    if (historyTimerRef.current) {
      clearTimeout(historyTimerRef.current);
      historyTimerRef.current = null;
    }

    const currentIndex = historyIndexRef.current;
    const currentHistory = historyRef.current;

    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      const content = currentHistory[newIndex];
      setHistoryIndex(newIndex);

      if (editorRef.current) {
        isUndoRedoRef.current = true; // undo 실행 중 플래그 설정
        editorRef.current.innerHTML = content;
        onChange(content);
        detectCurrentParagraphStyle();
        detectCurrentAlign();
        // 다음 틱에서 플래그 해제
        setTimeout(() => {
          isUndoRedoRef.current = false;
        }, 0);
      }
    }
  }, [onChange]);

  // Redo 실행
  const performRedo = useCallback(() => {
    // debounce 타이머 취소 (redo 중에는 히스토리 추가 안 함)
    if (historyTimerRef.current) {
      clearTimeout(historyTimerRef.current);
      historyTimerRef.current = null;
    }

    const currentIndex = historyIndexRef.current;
    const currentHistory = historyRef.current;

    if (currentIndex < currentHistory.length - 1) {
      const newIndex = currentIndex + 1;
      const content = currentHistory[newIndex];
      setHistoryIndex(newIndex);

      if (editorRef.current) {
        isUndoRedoRef.current = true; // redo 실행 중 플래그 설정
        editorRef.current.innerHTML = content;
        onChange(content);
        detectCurrentParagraphStyle();
        detectCurrentAlign();
        // 다음 틱에서 플래그 해제
        setTimeout(() => {
          isUndoRedoRef.current = false;
        }, 0);
      }
    }
  }, [onChange]);

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

      onChange(content);
      validateHandler(content);
      detectCurrentParagraphStyle();
      detectCurrentAlign();

      // 히스토리에 추가
      addToHistory(content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onChange, addToHistory]);

  // IME 입력 시작
  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  // IME 입력 종료
  const handleCompositionEnd = useCallback(() => {
    isComposingRef.current = false;
    justComposedRef.current = true;

    // composition 종료 시 직접 업데이트 처리
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
      validateHandler(content);
      detectCurrentParagraphStyle();
      detectCurrentAlign();
      addToHistory(content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onChange, addToHistory]);

  // 붙여넣기 이벤트 핸들러 - 지원하지 않는 스타일 제거
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();

    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    // HTML 데이터 가져오기
    const html = clipboardData.getData('text/html');
    const text = clipboardData.getData('text/plain');

    if (html) {
      // 임시 div를 만들어서 HTML 파싱
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;

      // 지원하는 태그와 스타일 정의
      const allowedTags = ['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'S', 'STRIKE', 'DEL',
                          'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'PRE',
                          'UL', 'OL', 'LI', 'A', 'IMG', 'SPAN', 'DIV'];
      const allowedStyles = ['color', 'background-color', 'text-align'];

      // 모든 요소를 순회하면서 정리
      const cleanElement = (element: Element): Node | null => {
        const tagName = element.tagName;

        // 지원하지 않는 태그는 내용만 유지
        if (!allowedTags.includes(tagName)) {
          const fragment = document.createDocumentFragment();
          Array.from(element.childNodes).forEach(child => {
            if (child.nodeType === Node.ELEMENT_NODE) {
              const cleaned = cleanElement(child as Element);
              if (cleaned) fragment.appendChild(cleaned);
            } else if (child.nodeType === Node.TEXT_NODE) {
              fragment.appendChild(child.cloneNode(true));
            }
          });
          return fragment.childNodes.length > 0 ? fragment : null;
        }

        // 지원하는 태그는 복제하고 스타일 정리
        const newElement = element.cloneNode(false) as HTMLElement;

        // 모든 속성 제거 후 필요한 것만 복원
        const attrs = Array.from(element.attributes);
        attrs.forEach(attr => newElement.removeAttribute(attr.name));

        // href, src, alt 등 필수 속성만 복원
        if (tagName === 'A' && element.getAttribute('href')) {
          newElement.setAttribute('href', element.getAttribute('href')!);
        }
        if (tagName === 'IMG') {
          if (element.getAttribute('src')) {
            newElement.setAttribute('src', element.getAttribute('src')!);
          }
          if (element.getAttribute('alt')) {
            newElement.setAttribute('alt', element.getAttribute('alt')!);
          }
        }

        // 스타일 복원 (허용된 것만)
        if (element instanceof HTMLElement && element.style) {
          allowedStyles.forEach(styleName => {
            const value = element.style.getPropertyValue(styleName);
            if (value) {
              (newElement as HTMLElement).style.setProperty(styleName, value);
            }
          });
        }

        // 자식 요소 처리
        Array.from(element.childNodes).forEach(child => {
          if (child.nodeType === Node.ELEMENT_NODE) {
            const cleaned = cleanElement(child as Element);
            if (cleaned) newElement.appendChild(cleaned);
          } else if (child.nodeType === Node.TEXT_NODE) {
            newElement.appendChild(child.cloneNode(true));
          }
        });

        return newElement;
      };

      // 정리된 HTML 생성
      const cleanedDiv = document.createElement('div');
      Array.from(tempDiv.childNodes).forEach(child => {
        if (child.nodeType === Node.ELEMENT_NODE) {
          const cleaned = cleanElement(child as Element);
          if (cleaned) cleanedDiv.appendChild(cleaned);
        } else if (child.nodeType === Node.TEXT_NODE) {
          cleanedDiv.appendChild(child.cloneNode(true));
        }
      });

      // 현재 커서 위치에 삽입
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();

        const fragment = document.createDocumentFragment();
        while (cleanedDiv.firstChild) {
          fragment.appendChild(cleanedDiv.firstChild);
        }
        range.insertNode(fragment);

        // 커서를 삽입된 내용의 끝으로 이동
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    } else if (text) {
      // HTML이 없으면 일반 텍스트 삽입
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(text));
        range.collapse(false);
      }
    }

    // 변경사항 반영
    handleInput();
  }, [handleInput]);

  const execCommand = (command: string, value: string | undefined = undefined) => {
    // undo/redo는 커스텀 함수 사용
    if (command === 'undo') {
      performUndo();
      return;
    }
    if (command === 'redo') {
      performRedo();
      return;
    }

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

  // 코드보기 토글
  const toggleCodeView = () => {
    if (isCodeView) {
      // 코드보기에서 일반 모드로 전환
      setIsCodeView(false);
      setSavedEditorHeight(null); // 저장된 높이 초기화
      // 다음 렌더링 사이클에서 에디터 내용 업데이트
      setTimeout(() => {
        if (editorRef.current && codeContent !== undefined) {
          editorRef.current.innerHTML = codeContent;
          handleInput();
        }
      }, 0);
    } else {
      // 일반 모드에서 코드보기로 전환
      if (editorRef.current) {
        // height가 contents일 때 현재 에디터 높이 저장
        if (height === 'contents') {
          const currentHeight = editorRef.current.scrollHeight;
          setSavedEditorHeight(currentHeight);
        }

        // 현재 HTML을 포맷팅
        const html = editorRef.current.innerHTML;
        const formattedHtml = formatHtml(html);
        setCodeContent(formattedHtml);
        setIsCodeView(true);
      }
    }
  };

  // HTML 포맷팅 함수
  const formatHtml = (html: string): string => {
    // 기본적인 HTML 포맷팅
    const formatted = html
      .replace(/></g, '>\n<')  // 태그 사이에 줄바꿈 추가
      .replace(/(<div|<p|<h[1-6]|<ul|<ol|<li|<blockquote)/gi, '\n$1')  // 블록 요소 앞에 줄바꿈
      .replace(/(<\/div>|<\/p>|<\/h[1-6]>|<\/ul>|<\/ol>|<\/li>|<\/blockquote>)/gi, '$1\n');  // 블록 요소 뒤에 줄바꿈

    // 들여쓰기 추가
    const lines = formatted.split('\n');
    let indentLevel = 0;
    const indentedLines = lines.map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '';

      // 닫는 태그인 경우 들여쓰기 레벨 감소
      if (trimmed.startsWith('</')) {
        indentLevel = Math.max(0, indentLevel - 1);
        const indented = '  '.repeat(indentLevel) + trimmed;
        return indented;
      }

      // 자체 닫는 태그가 아닌 여는 태그인 경우
      const indented = '  '.repeat(indentLevel) + trimmed;
      if (trimmed.startsWith('<') && !trimmed.startsWith('<!') &&
          !trimmed.endsWith('/>') && trimmed.includes('>') &&
          !trimmed.includes('</')) {
        indentLevel++;
      }

      return indented;
    });

    return indentedLines.filter(line => line !== '').join('\n');
  };

  // 코드 에디터 내용 변경 처리
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCodeContent(e.target.value);
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

  const applyLink = () => {
    if (linkUrl && savedSelection) {
      restoreSelection(savedSelection);

      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        const selectedText = range.toString();

        // Create link element
        const link = document.createElement('a');
        link.href = linkUrl;
        link.textContent = selectedText;

        // Set target attribute
        if (linkTarget === '_blank') {
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
        }

        // Replace selection with link
        range.deleteContents();
        range.insertNode(link);

        // Clear and close dropdown
        setLinkUrl('');
        setLinkTarget('_blank');
        setIsLinkDropdownOpen(false);
        setSavedSelection(null);

        editorRef.current?.focus();
        handleInput();
      }
    }
  };

  const openLinkDropdown = () => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      // Save selection
      const range = saveSelection();
      setSavedSelection(range);
      setIsLinkDropdownOpen(true);
      setIsParagraphDropdownOpen(false);
      setIsTextColorOpen(false);
      setIsBgColorOpen(false);
      setIsAlignDropdownOpen(false);
    }
  };

  // 이미지 선택
  const selectImage = (img: HTMLImageElement) => {
    // 기존 선택 해제
    if (selectedImage) {
      deselectImage();
    }

    setSelectedImage(img);

    // 이미지 주위에 wrapper 추가
    const wrapper = document.createElement('div');
    wrapper.className = 'image-wrapper';
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';
    wrapper.style.border = '2px solid #0084ff';
    wrapper.style.padding = '0';

    // 리사이즈 핸들 추가
    const handles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
    handles.forEach(handle => {
      const handleDiv = document.createElement('div');
      handleDiv.className = `resize-handle resize-handle-${handle}`;
      handleDiv.dataset.handle = handle;
      handleDiv.style.position = 'absolute';
      handleDiv.style.width = '8px';
      handleDiv.style.height = '8px';
      handleDiv.style.backgroundColor = '#0084ff';
      handleDiv.style.border = '1px solid white';
      handleDiv.style.borderRadius = '2px';
      handleDiv.style.cursor = `${handle}-resize`;

      // 핸들 위치 설정
      switch(handle) {
        case 'nw': handleDiv.style.top = '-5px'; handleDiv.style.left = '-5px'; break;
        case 'n': handleDiv.style.top = '-5px'; handleDiv.style.left = '50%'; handleDiv.style.transform = 'translateX(-50%)'; break;
        case 'ne': handleDiv.style.top = '-5px'; handleDiv.style.right = '-5px'; break;
        case 'e': handleDiv.style.top = '50%'; handleDiv.style.right = '-5px'; handleDiv.style.transform = 'translateY(-50%)'; break;
        case 'se': handleDiv.style.bottom = '-5px'; handleDiv.style.right = '-5px'; break;
        case 's': handleDiv.style.bottom = '-5px'; handleDiv.style.left = '50%'; handleDiv.style.transform = 'translateX(-50%)'; break;
        case 'sw': handleDiv.style.bottom = '-5px'; handleDiv.style.left = '-5px'; break;
        case 'w': handleDiv.style.top = '50%'; handleDiv.style.left = '-5px'; handleDiv.style.transform = 'translateY(-50%)'; break;
      }

      // 리사이즈 이벤트 핸들러
      handleDiv.onmousedown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        startResize(e, img, handle);
      };

      wrapper.appendChild(handleDiv);
    });

    // 이미지를 wrapper로 감싸기
    const parent = img.parentNode;
    parent?.insertBefore(wrapper, img);
    wrapper.appendChild(img);

    // 편집 팝업 데이터 설정
    // 이미지 크기 확인
    if (img.style.width) {
      setEditImageWidth(img.style.width);
    } else {
      setEditImageWidth('original');
    }

    // 이미지의 정렬 상태 확인 - 부모 div의 textAlign 체크
    let container = img.parentElement;
    let currentAlign = 'left'; // 기본값

    // 부모 요소를 올라가며 textAlign이 설정된 div 찾기
    while (container && container !== editorRef.current) {
      if (container.tagName === 'DIV' && container.style.textAlign) {
        currentAlign = container.style.textAlign;
        break;
      }
      container = container.parentElement;
    }

    setEditImageAlign(currentAlign);
    setEditImageAlt(img.alt || '');

    // 약간의 지연 후 편집창 열기 (클릭 이벤트 완전 처리 후)
    setTimeout(() => {
      setIsImageEditPopupOpen(true);
    }, 50);
  };

  // 이미지 선택 해제
  const deselectImage = () => {
    if (!selectedImage) return;

    // wrapper 제거
    const wrapper = selectedImage.parentElement;
    if (wrapper && wrapper.classList.contains('image-wrapper')) {
      const parent = wrapper.parentNode;
      if (parent) {
        try {
          // 이미지를 wrapper 밖으로 이동
          parent.insertBefore(selectedImage, wrapper);
          // wrapper 제거
          wrapper.remove();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          // 이미 제거된 경우 무시
        }
      }
    }

    // 이미지 draggable 속성 제거
    if (selectedImage) {
      selectedImage.draggable = false;
    }

    // 상태 초기화
    setSelectedImage(null);
    setIsImageEditPopupOpen(false);
    setIsResizing(false);
    setResizeStartData(null);
  };

  // 리사이즈 시작
  const startResize = (e: MouseEvent, img: HTMLImageElement, handle: string) => {
    setIsResizing(true);
    setResizeStartData({
      startX: e.clientX,
      startY: e.clientY,
      startWidth: img.offsetWidth,
      startHeight: img.offsetHeight,
      handle
    });
  };

  // 이미지 편집 적용
  const applyImageEdit = () => {
    if (!selectedImage) return;

    // 크기 적용
    if (editImageWidth) {
      if (editImageWidth.includes('%')) {
        selectedImage.style.width = editImageWidth;
        selectedImage.style.height = 'auto';
      } else if (editImageWidth === 'original') {
        selectedImage.style.width = '';
        selectedImage.style.height = '';
      } else {
        selectedImage.style.width = editImageWidth;
        selectedImage.style.height = 'auto';
      }
    }

    // 정렬 적용 - 이미지를 감싸는 정렬 컨테이너 찾기 또는 생성
    let alignContainer = selectedImage.parentElement;

    // wrapper가 있으면 그 부모를 확인
    if (alignContainer?.classList.contains('image-wrapper')) {
      alignContainer = alignContainer.parentElement;
    }

    // 정렬 컨테이너가 이미 있는지 확인 (div이고 textAlign이 설정된 경우)
    if (alignContainer && alignContainer.tagName === 'DIV' && alignContainer !== editorRef.current) {
      // 기존 컨테이너의 정렬 변경
      alignContainer.style.textAlign = editImageAlign;
    } else {
      // 정렬 컨테이너가 없으면 새로 생성
      const newContainer = document.createElement('div');
      newContainer.style.textAlign = editImageAlign;

      // wrapper나 이미지를 새 컨테이너로 감싸기
      const elementToWrap = selectedImage.parentElement?.classList.contains('image-wrapper')
        ? selectedImage.parentElement
        : selectedImage;

      if (elementToWrap.parentNode) {
        elementToWrap.parentNode.insertBefore(newContainer, elementToWrap);
        newContainer.appendChild(elementToWrap);
      }
    }

    // 대체 텍스트 적용
    selectedImage.alt = editImageAlt;

    // 선택 해제
    deselectImage();
    handleInput();
  };

  // 이미지 삭제
  const deleteImage = () => {
    if (!selectedImage) return;

    // 먼저 선택 해제 (상태 초기화)
    const imageToDelete = selectedImage;
    deselectImage();

    // wrapper가 있는 경우 wrapper를 찾아서 제거
    let elementToRemove: HTMLElement = imageToDelete;
    let parent = imageToDelete.parentElement;

    // wrapper를 거슬러 올라가며 정렬 컨테이너까지 찾기
    while (parent && parent !== editorRef.current) {
      if (parent.classList.contains('image-wrapper') ||
          (parent.tagName === 'DIV' && parent.style.textAlign)) {
        elementToRemove = parent;
        parent = parent.parentElement;
      } else {
        break;
      }
    }

    // DOM에서 제거
    if (elementToRemove.parentNode) {
      elementToRemove.parentNode.removeChild(elementToRemove);
    }

    handleInput();
  };

  // 링크 요소 클릭 감지
  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    // 리사이즈 핸들 클릭은 무시
    if (target.classList.contains('resize-handle')) {
      return;
    }

    // 이미지 편집 팝업 클릭은 무시
    if (target.closest(`.${styles.imageDropdown}`)) {
      return;
    }

    // 유튜브 편집 팝업 클릭은 무시
    if (target.closest(`.${styles.youtubeEditPopup}`)) {
      return;
    }

    // 유튜브 오버레이 클릭 감지
    if ((target.classList.contains('youtube-overlay') || target.closest('.youtube-container')) && editorRef.current?.contains(target)) {
      e.preventDefault();
      e.stopPropagation();

      const youtubeContainer = target.closest('.youtube-container') as HTMLElement;
      if (youtubeContainer) {
        // 이미 선택된 유튜브가 아닌 경우에만 선택
        if (selectedYoutube !== youtubeContainer) {
          // 기존 선택 해제
          if (selectedYoutube) {
            deselectYoutube();
          }
          if (selectedImage) {
            deselectImage();
          }
          selectYoutube(youtubeContainer);
        } else {
          // 같은 유튜브를 다시 클릭하면 편집창 토글
          setIsYoutubeEditPopupOpen(!isYoutubeEditPopupOpen);
        }
      }
      return;
    }

    // 이미지 요소인지 확인
    if (target.tagName === 'IMG' && editorRef.current?.contains(target)) {
      e.preventDefault();
      e.stopPropagation();
      const img = target as HTMLImageElement;

      // 이미 선택된 이미지가 아닌 경우에만 선택
      if (selectedImage !== img) {
        // 기존 선택 해제
        if (selectedImage) {
          deselectImage();
        }
        if (selectedYoutube) {
          deselectYoutube();
        }
        selectImage(img);
      } else {
        // 같은 이미지를 다시 클릭하면 편집창 토글
        setIsImageEditPopupOpen(!isImageEditPopupOpen);
      }
      return;
    }

    // 기존 선택된 이미지가 있으면 선택 해제
    // image-wrapper 또는 리사이즈 핸들이 아닌 경우
    // 단, 리사이즈 중일 때는 선택 해제하지 않음
    if (selectedImage && !target.closest('.image-wrapper') && !isResizing) {
      deselectImage();
    }

    // 기존 선택된 유튜브가 있으면 선택 해제
    // 단, 리사이즈 중일 때는 선택 해제하지 않음
    if (selectedYoutube && !target.closest('.youtube-wrapper') && !isResizing) {
      deselectYoutube();
    }

    // 링크 요소인지 확인
    const linkElement = target.closest('a') as HTMLAnchorElement;
    if (linkElement && editorRef.current?.contains(linkElement)) {
      e.preventDefault();
      setSelectedLinkElement(linkElement);
      setEditLinkUrl(linkElement.href);
      setEditLinkTarget(linkElement.target || '_self');
      setIsEditLinkPopupOpen(true);
    } else {
      // 일반 클릭 처리
      detectCurrentParagraphStyle();
      detectCurrentAlign();
    }
  };

  // 링크 수정
  const updateLink = () => {
    if (selectedLinkElement && editLinkUrl) {
      selectedLinkElement.href = editLinkUrl;

      if (editLinkTarget === '_blank') {
        selectedLinkElement.target = '_blank';
        selectedLinkElement.rel = 'noopener noreferrer';
      } else {
        selectedLinkElement.removeAttribute('target');
        selectedLinkElement.removeAttribute('rel');
      }

      setIsEditLinkPopupOpen(false);
      setSelectedLinkElement(null);
      editorRef.current?.focus();
      handleInput();
    }
  };

  // 링크 삭제
  const removeLink = () => {
    if (selectedLinkElement) {
      const parent = selectedLinkElement.parentNode;
      const textContent = selectedLinkElement.textContent || '';
      const textNode = document.createTextNode(textContent);

      parent?.replaceChild(textNode, selectedLinkElement);

      setIsEditLinkPopupOpen(false);
      setSelectedLinkElement(null);
      editorRef.current?.focus();
      handleInput();
    }
  };

  const openImageDropdown = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    // 현재 선택 영역 저장
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0).cloneRange();
      setSavedImageSelection(range);
    } else {
      setSavedImageSelection(null);
    }

    setIsImageDropdownOpen(true);
    setImageTabMode('file'); // 기본값으로 파일 업로드 탭 선택
    setIsParagraphDropdownOpen(false);
    setIsTextColorOpen(false);
    setIsBgColorOpen(false);
    setIsAlignDropdownOpen(false);
    setIsLinkDropdownOpen(false);
  };

  const insertImage = async () => {
    let imageSrc = '';

    // 파일이 업로드된 경우
    if (imageFile && imagePreview) {
      imageSrc = imagePreview;
    }
    // URL이 입력된 경우
    else if (imageUrl) {
      // URL 유효성 검사
      try {
        const testImg = new Image();

        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Timeout'));
          }, 5000); // 5초 타임아웃

          testImg.onload = () => {
            clearTimeout(timeout);
            resolve(true);
          };

          testImg.onerror = () => {
            clearTimeout(timeout);
            reject(new Error('Load failed'));
          };

          // CORS를 우회하기 위해 crossOrigin 설정하지 않음
          testImg.src = imageUrl;
        });

        imageSrc = imageUrl;
      } catch (error) {
        console.error('Image validation failed:', error);
        alert(`이미지를 불러올 수 없습니다.\n\n가능한 원인:\n1. 잘못된 이미지 URL\n2. CORS 정책으로 인한 차단 (외부 도메인)\n3. 네트워크 연결 문제\n4. 이미지가 존재하지 않음\n\nURL: ${imageUrl}\n\n💡 팁: CORS 정책으로 차단된 경우, 이미지를 직접 다운로드 후 파일 업로드를 사용해주세요.`);
        return;
      }
    }

    if (!imageSrc) return;

    // 이미지 엘리먼트 생성
    const img = document.createElement('img');
    img.src = imageSrc;
    img.alt = imageAlt || '';

    // display를 inline-block으로 설정하여 정렬이 작동하도록 함
    img.style.display = 'inline-block';
    img.style.verticalAlign = 'middle'; // 수직 정렬 개선

    // 이미지 로드 에러 처리
    img.onerror = () => {
      console.error('Image load failed:', imageSrc);
      alert(`이미지를 불러올 수 없습니다.\n\n가능한 원인:\n1. 잘못된 이미지 URL\n2. CORS 정책으로 인한 차단\n3. 네트워크 연결 문제\n\nURL: ${imageSrc}`);

      // 에러 발생 시 삽입된 이미지 제거
      if (img.parentNode) {
        img.parentNode.removeChild(img);
      }
    };

    // 이미지 로드 성공 처리
    img.onload = () => {
      // 이미지 로드 성공
    };

    // 크기 설정
    if (imageWidth === '100%') {
      img.style.width = '100%';
      img.style.height = 'auto';
    } else if (imageWidth === '75%') {
      img.style.width = '75%';
      img.style.height = 'auto';
    } else if (imageWidth === '50%') {
      img.style.width = '50%';
      img.style.height = 'auto';
    }
    // '원본'인 경우 스타일을 설정하지 않음

    // 컨테이너 div 생성 (정렬용)
    const container = document.createElement('div');
    container.style.textAlign = imageAlign;
    container.appendChild(img);

    // 에디터에 포커스 먼저 설정
    if (editorRef.current) {
      editorRef.current.focus();

      const selection = window.getSelection();

      // 저장된 선택 영역이 있으면 복원
      if (savedImageSelection && selection) {
        try {
          selection.removeAllRanges();
          selection.addRange(savedImageSelection);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          // 복원 실패 시 무시
        }
      }

      // 선택 영역 재확인
      if (!selection || selection.rangeCount === 0 || !editorRef.current.contains(selection.anchorNode)) {
        // 에디터가 비어있으면 p 태그 추가
        if (!editorRef.current.innerHTML || editorRef.current.innerHTML === '<br>') {
          const p = document.createElement('p');
          p.innerHTML = '<br>';
          editorRef.current.appendChild(p);
        }

        // 커서를 에디터 끝으로 이동
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }

      // 이제 이미지 삽입
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(container);

        // 이미지 다음에 새 문단 추가
        const newP = document.createElement('p');
        newP.innerHTML = '<br>';
        container.after(newP);

        // 커서를 새 문단으로 이동
        const newRange = document.createRange();
        newRange.selectNodeContents(newP);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);

      } else {
        // 폴백: 에디터 끝에 추가
        editorRef.current.appendChild(container);
      }
    }



    // 상태 초기화
    setIsImageDropdownOpen(false);
    setImageTabMode('file'); // 탭 모드도 초기화
    setImageUrl('');
    setImageFile(null);
    setImagePreview('');
    setImageWidth('original'); // 원본으로 초기화
    setImageAlign('left'); // 좌측으로 초기화
    setImageAlt('');
    setSavedImageSelection(null); // 저장된 선택 영역 초기화

    editorRef.current?.focus();
    handleInput();
  };

  // YouTube URL에서 Video ID 추출
  const extractYoutubeVideoId = (url: string): string | null => {
    // 다양한 YouTube URL 형식 지원
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  // YouTube 선택
  const selectYoutube = (youtubeContainer: HTMLElement) => {
    // 기존 선택 해제
    if (selectedYoutube) {
      deselectYoutube();
    }
    if (selectedImage) {
      deselectImage();
    }

    setSelectedYoutube(youtubeContainer);

    // 유튜브 주위에 wrapper 추가
    const wrapper = document.createElement('div');
    wrapper.className = 'youtube-wrapper';
    wrapper.style.position = 'relative';
    wrapper.style.border = '2px solid #0084ff';
    wrapper.style.padding = '0';

    // wrapper를 유튜브 컨테이너와 동일한 display 속성으로 설정
    const computedStyle = window.getComputedStyle(youtubeContainer);
    wrapper.style.display = computedStyle.display;
    // style.width가 있으면 그것을 사용, 없으면 computed width 사용
    wrapper.style.width = youtubeContainer.style.width || computedStyle.width;

    // 원본 스타일 저장 (나중에 복원용)
    youtubeContainer.dataset.originalWidth = youtubeContainer.style.width;
    youtubeContainer.dataset.originalDisplay = youtubeContainer.style.display;

    // 리사이즈 핸들 추가 (8개 포인트)
    const handles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
    handles.forEach(handle => {
      const handleDiv = document.createElement('div');
      handleDiv.className = `resize-handle resize-handle-${handle}`;
      handleDiv.dataset.handle = handle;
      handleDiv.style.position = 'absolute';
      handleDiv.style.width = '8px';
      handleDiv.style.height = '8px';
      handleDiv.style.backgroundColor = '#0084ff';
      handleDiv.style.border = '1px solid white';
      handleDiv.style.borderRadius = '2px';
      handleDiv.style.cursor = `${handle}-resize`;

      // 핸들 위치 설정
      switch(handle) {
        case 'nw': handleDiv.style.top = '-5px'; handleDiv.style.left = '-5px'; break;
        case 'n': handleDiv.style.top = '-5px'; handleDiv.style.left = '50%'; handleDiv.style.transform = 'translateX(-50%)'; break;
        case 'ne': handleDiv.style.top = '-5px'; handleDiv.style.right = '-5px'; break;
        case 'e': handleDiv.style.top = '50%'; handleDiv.style.right = '-5px'; handleDiv.style.transform = 'translateY(-50%)'; break;
        case 'se': handleDiv.style.bottom = '-5px'; handleDiv.style.right = '-5px'; break;
        case 's': handleDiv.style.bottom = '-5px'; handleDiv.style.left = '50%'; handleDiv.style.transform = 'translateX(-50%)'; break;
        case 'sw': handleDiv.style.bottom = '-5px'; handleDiv.style.left = '-5px'; break;
        case 'w': handleDiv.style.top = '50%'; handleDiv.style.left = '-5px'; handleDiv.style.transform = 'translateY(-50%)'; break;
      }

      // 리사이즈 이벤트 핸들러
      handleDiv.onmousedown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        startYoutubeResize(e, youtubeContainer, handle);
      };

      wrapper.appendChild(handleDiv);
    });

    // 유튜브를 wrapper로 감싸기
    const parent = youtubeContainer.parentNode;
    parent?.insertBefore(wrapper, youtubeContainer);
    wrapper.appendChild(youtubeContainer);

    // 편집 팝업 데이터 설정
    // 컨테이너 크기 확인
    if (youtubeContainer.style.width) {
      if (youtubeContainer.style.width === '560px') {
        setEditYoutubeWidth('original');
      } else if (youtubeContainer.style.width.includes('%')) {
        setEditYoutubeWidth(youtubeContainer.style.width);
      } else {
        // px 값을 %로 변환
        const parentWidth = editorRef.current?.offsetWidth || window.innerWidth;
        const containerWidth = parseInt(youtubeContainer.style.width);
        const percentage = Math.round((containerWidth / parentWidth) * 100);

        if (percentage >= 95) {
          setEditYoutubeWidth('100%');
        } else if (percentage >= 70 && percentage <= 80) {
          setEditYoutubeWidth('75%');
        } else if (percentage >= 45 && percentage <= 55) {
          setEditYoutubeWidth('50%');
        } else {
          setEditYoutubeWidth(`${percentage}%`);
        }
      }
    } else {
      setEditYoutubeWidth('100%');
    }

    // 정렬 확인
    let alignContainer = youtubeContainer.parentElement;
    let currentAlign = 'center';
    while (alignContainer && alignContainer !== editorRef.current) {
      if (alignContainer.tagName === 'DIV' && alignContainer.style.textAlign) {
        currentAlign = alignContainer.style.textAlign;
        break;
      }
      alignContainer = alignContainer.parentElement;
    }
    setEditYoutubeAlign(currentAlign);

    // 약간의 지연 후 편집창 열기
    setTimeout(() => {
      setIsYoutubeEditPopupOpen(true);
    }, 50);
  };

  // YouTube 선택 해제
  const deselectYoutube = () => {
    if (!selectedYoutube) return;

    // 원본 스타일 복원
    if (selectedYoutube.dataset.originalWidth !== undefined) {
      selectedYoutube.style.width = selectedYoutube.dataset.originalWidth;
      delete selectedYoutube.dataset.originalWidth;
    }
    if (selectedYoutube.dataset.originalDisplay !== undefined) {
      selectedYoutube.style.display = selectedYoutube.dataset.originalDisplay;
      delete selectedYoutube.dataset.originalDisplay;
    }

    // wrapper 제거
    const wrapper = selectedYoutube.parentElement;
    if (wrapper && wrapper.classList.contains('youtube-wrapper')) {
      const parent = wrapper.parentNode;
      if (parent) {
        try {
          parent.insertBefore(selectedYoutube, wrapper);
          wrapper.remove();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          // 이미 제거된 경우 무시
        }
      }
    }

    // 상태 초기화
    setSelectedYoutube(null);
    setIsYoutubeEditPopupOpen(false);
  };

  // YouTube 리사이즈 시작
  const startYoutubeResize = (e: MouseEvent, container: HTMLElement, handle: string) => {
    // 컨테이너의 실제 크기를 가져옴 (getBoundingClientRect로 실제 픽셀 크기 가져오기)
    const rect = container.getBoundingClientRect();
    const currentWidth = rect.width;
    const currentHeight = rect.height || (currentWidth / (16/9)); // height가 없으면 16:9 비율로 계산

    setIsResizing(true);
    setResizeStartData({
      startX: e.clientX,
      startY: e.clientY,
      startWidth: currentWidth,
      startHeight: currentHeight,
      handle
    });
  };

  // YouTube 편집 적용
  const applyYoutubeEdit = () => {
    if (!selectedYoutube) return;

    // 크기 적용
    if (editYoutubeWidth === '100%' || editYoutubeWidth === '75%' || editYoutubeWidth === '50%') {
      // 퍼센트 값은 그대로 유지
      selectedYoutube.style.width = editYoutubeWidth;
      selectedYoutube.style.aspectRatio = '16 / 9';
      selectedYoutube.style.height = 'auto';
    } else if (editYoutubeWidth === 'original') {
      // original은 고정 크기
      selectedYoutube.style.aspectRatio = '';
      selectedYoutube.style.width = '560px';
      selectedYoutube.style.height = '315px';
    } else {
      // px 값은 그대로 설정 (리사이즈로 변경된 경우)
      selectedYoutube.style.aspectRatio = '';
      selectedYoutube.style.width = editYoutubeWidth;
      // height 계산
      const width = parseInt(editYoutubeWidth);
      const height = width / (16 / 9);
      selectedYoutube.style.height = height + 'px';
    }

    // wrapper 크기도 업데이트
    const wrapper = selectedYoutube.parentElement;
    if (wrapper && wrapper.classList.contains('youtube-wrapper')) {
      wrapper.style.width = selectedYoutube.style.width;
      wrapper.style.aspectRatio = selectedYoutube.style.aspectRatio;
      if (selectedYoutube.style.height && selectedYoutube.style.height !== 'auto') {
        wrapper.style.height = selectedYoutube.style.height;
      } else {
        wrapper.style.height = 'auto';
      }
    }

    // dataset의 originalWidth도 업데이트 (선택 해제 시 이 크기로 복원)
    selectedYoutube.dataset.originalWidth = selectedYoutube.style.width;

    // 정렬 적용
    // youtube-wrapper의 부모를 찾음
    const targetElement = selectedYoutube.parentElement?.classList.contains('youtube-wrapper')
      ? selectedYoutube.parentElement
      : selectedYoutube;

    // 정렬 컨테이너 찾기 (최상위 DIV 컨테이너)
    const alignContainer = targetElement?.parentElement;

    // 정렬 컨테이너가 있고 DIV이면 정렬 적용
    if (alignContainer && alignContainer.tagName === 'DIV' && alignContainer !== editorRef.current) {
      alignContainer.style.textAlign = editYoutubeAlign;

      // 유튜브 컨테이너 자체도 적절한 display 설정
      if (editYoutubeAlign === 'center' || editYoutubeAlign === 'right') {
        selectedYoutube.style.display = 'inline-block';
      } else {
        selectedYoutube.style.display = 'inline-block';
      }
    }

    // 선택 해제
    deselectYoutube();
    handleInput();
  };

  // YouTube 삭제
  const deleteYoutube = () => {
    if (!selectedYoutube) return;

    const youtubeToDelete = selectedYoutube;
    deselectYoutube();

    let elementToRemove: HTMLElement = youtubeToDelete;
    let parent = youtubeToDelete.parentElement;

    while (parent && parent !== editorRef.current) {
      if (parent.classList.contains('youtube-wrapper') ||
          parent.classList.contains('youtube-container') ||
          (parent.tagName === 'DIV' && parent.style.textAlign)) {
        elementToRemove = parent;
        parent = parent.parentElement;
      } else {
        break;
      }
    }

    if (elementToRemove.parentNode) {
      elementToRemove.parentNode.removeChild(elementToRemove);
    }

    handleInput();
  };

  // YouTube 삽입
  const insertYoutube = () => {
    if (!youtubeUrl) return;

    const videoId = extractYoutubeVideoId(youtubeUrl);
    if (!videoId) {
      alert('올바른 유튜브 URL을 입력해주세요.\n\n지원 형식:\n• https://www.youtube.com/watch?v=VIDEO_ID\n• https://youtu.be/VIDEO_ID');
      return;
    }

    // YouTube 정렬 컨테이너 생성
    const alignContainer = document.createElement('div');
    alignContainer.style.textAlign = youtubeAlign;
    alignContainer.style.margin = '20px 0';

    // YouTube iframe 컨테이너 생성
    const container = document.createElement('div');
    container.className = 'youtube-container';
    container.style.position = 'relative';
    container.style.display = 'inline-block';
    container.style.maxWidth = '100%';

    // 크기 설정
    if (youtubeWidth === 'original') {
      container.style.width = '560px';
      container.style.height = '315px';
    } else if (youtubeWidth === '100%' || youtubeWidth === '75%' || youtubeWidth === '50%') {
      // 퍼센트는 그대로 유지하고 aspect-ratio 사용
      container.style.width = youtubeWidth;
      container.style.aspectRatio = '16 / 9';
    } else {
      // 기타 값은 그대로 설정
      container.style.width = youtubeWidth;
      container.style.aspectRatio = '16 / 9';
    }

    // iframe 생성
    const iframe = document.createElement('iframe');
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.src = `https://www.youtube.com/embed/${videoId}`;
    iframe.title = 'YouTube video player';
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    iframe.style.width = '100%';
    iframe.style.height = 'auto';
    iframe.style.aspectRatio = '16 / 9';
    iframe.style.display = 'block';

    // 투명 오버레이 추가 (편집 모드에서 클릭 방지)
    const overlay = document.createElement('div');
    overlay.className = 'youtube-overlay';
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'transparent';
    overlay.style.cursor = 'pointer';
    overlay.style.zIndex = '1';

    container.appendChild(iframe);
    container.appendChild(overlay);
    alignContainer.appendChild(container);

    // 에디터에 포커스 설정
    if (editorRef.current) {
      editorRef.current.focus();

      const selection = window.getSelection();

      // 저장된 선택 영역이 있으면 복원
      if (savedYoutubeSelection && selection) {
        try {
          selection.removeAllRanges();
          selection.addRange(savedYoutubeSelection);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          // 선택 영역 복원 실패 시 무시
        }
      }

      // 선택 영역 재확인
      if (!selection || selection.rangeCount === 0 || !editorRef.current.contains(selection.anchorNode)) {
        // 에디터가 비어있으면 p 태그 추가
        if (!editorRef.current.innerHTML || editorRef.current.innerHTML === '<br>') {
          const p = document.createElement('p');
          p.innerHTML = '<br>';
          editorRef.current.appendChild(p);
        }

        // 커서를 에디터 끝으로 이동
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }

      // YouTube iframe 삽입
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(alignContainer);

        // iframe 다음에 새 문단 추가
        const newP = document.createElement('p');
        newP.innerHTML = '<br>';
        alignContainer.after(newP);

        // 커서를 새 문단으로 이동
        const newRange = document.createRange();
        newRange.selectNodeContents(newP);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      } else {
        // 폴백: 에디터 끝에 추가
        editorRef.current.appendChild(alignContainer);
      }
    }

    // 상태 초기화
    setIsYoutubeDropdownOpen(false);
    setYoutubeUrl('');
    setYoutubeWidth('100%'); // 초기화
    setYoutubeAlign('center'); // 초기화
    setSavedYoutubeSelection(null);

    editorRef.current?.focus();
    handleInput();
  };

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        // URL 필드 초기화
        setImageUrl('');
      };
      reader.readAsDataURL(file);
    } else {
      alert('이미지 파일을 선택해주세요.');
    }
    // 같은 파일을 다시 선택할 수 있도록 초기화
    e.target.value = '';
  };

  // 기존 handleFileUpload은 삭제 또는 제거 예정
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
    // Backspace 또는 Delete 키로 선택된 이미지 삭제
    if ((e.key === 'Backspace' || e.key === 'Delete') && selectedImage) {
      e.preventDefault();

      // deleteImage 함수 호출로 통합
      deleteImage();
      return;
    }

    // Backspace 또는 Delete 키로 선택된 유튜브 삭제
    if ((e.key === 'Backspace' || e.key === 'Delete') && selectedYoutube) {
      e.preventDefault();
      deleteYoutube();
      return;
    }

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

  // 클라이언트에서만 고유 ID 생성
  useEffect(() => {
    setEditorID(`editor-${uuid()}`);
  }, []);

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

      if (linkButtonRef.current && !linkButtonRef.current.contains(target)) {
        setIsLinkDropdownOpen(false);
        setLinkUrl('');
        setLinkTarget('_blank');
        setSavedSelection(null);
      }

      // 이미지 드롭다운 체크 - 드롭다운 자체도 체크
      const imageDropdown = document.querySelector(`.${styles.imageDropdown}`);
      if (imageButtonRef.current &&
          !imageButtonRef.current.contains(target) &&
          (!imageDropdown || !imageDropdown.contains(target))) {
        setIsImageDropdownOpen(false);
        setImageTabMode('file'); // 탭 모드 초기화
        setImageUrl('');
        setImageFile(null);
        setImagePreview('');
        setImageWidth('original'); // 원본으로 초기화
        setImageAlign('left'); // 좌측으로 초기화
        setImageAlt('');
        setSavedImageSelection(null); // 저장된 선택 영역 초기화
      }

      // 유튜브 드롭다운 체크
      const youtubeDropdown = document.querySelector(`.${styles.youtubeDropdown}`);
      if (youtubeButtonRef.current &&
          !youtubeButtonRef.current.contains(target) &&
          (!youtubeDropdown || !youtubeDropdown.contains(target))) {
        setIsYoutubeDropdownOpen(false);
        setYoutubeUrl('');
        setSavedYoutubeSelection(null);
      }

      // 이미지 편집 팝업 닫기
      if (isImageEditPopupOpen && selectedImage) {
        const imageEditPopup = document.querySelector(`.${styles.imageDropdown}`);
        // 편집 팝업, 선택된 이미지, image-wrapper 외부를 클릭한 경우
        if (imageEditPopup &&
            !imageEditPopup.contains(target) &&
            !selectedImage.contains(target) &&
            !selectedImage.parentElement?.contains(target)) {
          setIsImageEditPopupOpen(false);
        }
      }

      // 링크 수정 팝업 닫기
      if (isEditLinkPopupOpen) {
        const editPopup = document.querySelector(`.${styles.editLinkPopup}`);
        if (editPopup && !editPopup.contains(target) && !selectedLinkElement?.contains(target)) {
          setIsEditLinkPopupOpen(false);
          setSelectedLinkElement(null);
          setEditLinkUrl('');
          setEditLinkTarget('_self');
        }
      }
    };

    if (isParagraphDropdownOpen || isTextColorOpen || isBgColorOpen || isAlignDropdownOpen || isLinkDropdownOpen || isEditLinkPopupOpen || isImageDropdownOpen || isImageEditPopupOpen || isYoutubeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isParagraphDropdownOpen, isTextColorOpen, isBgColorOpen, isAlignDropdownOpen, isLinkDropdownOpen, isEditLinkPopupOpen, isImageDropdownOpen, isImageEditPopupOpen, isYoutubeDropdownOpen, selectedLinkElement, selectedImage]);

  // 리사이즈 중 마우스 이벤트 처리
  useEffect(() => {
    if (!isResizing || !resizeStartData) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeStartData) return;

      const deltaX = e.clientX - resizeStartData.startX;
      const deltaY = e.clientY - resizeStartData.startY;

      // 이미지 리사이즈
      if (selectedImage) {
        const aspectRatio = resizeStartData.startWidth / resizeStartData.startHeight;
        let newWidth = resizeStartData.startWidth;
        let newHeight = resizeStartData.startHeight;

        switch (resizeStartData.handle) {
          case 'e':
          case 'w':
            newWidth = resizeStartData.startWidth + (resizeStartData.handle === 'e' ? deltaX : -deltaX);
            newHeight = newWidth / aspectRatio;
            break;
          case 'n':
          case 's':
            newHeight = resizeStartData.startHeight + (resizeStartData.handle === 's' ? deltaY : -deltaY);
            newWidth = newHeight * aspectRatio;
            break;
          case 'ne':
          case 'nw':
          case 'se':
          case 'sw': {
            // 대각선 리사이즈는 더 큰 변화량 기준
            const diagonalDelta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
            const multiplier = resizeStartData.handle.includes('e') ? 1 : -1;
            newWidth = resizeStartData.startWidth + (diagonalDelta * multiplier);
            newHeight = newWidth / aspectRatio;
            break;
          }
        }

        // 최소 크기 제한
        newWidth = Math.max(50, newWidth);
        newHeight = Math.max(50, newHeight);

        selectedImage.style.width = newWidth + 'px';
        selectedImage.style.height = newHeight + 'px';
      }

      // 유튜브 리사이즈
      if (selectedYoutube) {
        const aspectRatio = 16 / 9; // 유튜브는 16:9 고정
        let newWidth = resizeStartData.startWidth;
        let newHeight = resizeStartData.startHeight;

        switch (resizeStartData.handle) {
          case 'e':
          case 'w':
            newWidth = resizeStartData.startWidth + (resizeStartData.handle === 'e' ? deltaX : -deltaX);
            newHeight = newWidth / aspectRatio;
            break;
          case 'n':
          case 's':
            newHeight = resizeStartData.startHeight + (resizeStartData.handle === 's' ? deltaY : -deltaY);
            newWidth = newHeight * aspectRatio;
            break;
          case 'ne':
          case 'nw':
          case 'se':
          case 'sw': {
            // 대각선 리사이즈는 더 큰 변화량 기준
            const diagonalDelta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
            const multiplier = resizeStartData.handle.includes('e') ? 1 : -1;
            newWidth = resizeStartData.startWidth + (diagonalDelta * multiplier);
            newHeight = newWidth / aspectRatio;
            break;
          }
        }

        // 최소/최대 크기 제한
        const parentWidth = editorRef.current?.offsetWidth || window.innerWidth;
        newWidth = Math.max(200, Math.min(newWidth, parentWidth - 40));
        newHeight = newWidth / aspectRatio;

        // 유튜브 컨테이너 크기 업데이트
        // aspectRatio를 제거하고 명시적인 크기 설정
        selectedYoutube.style.aspectRatio = '';
        selectedYoutube.style.width = newWidth + 'px';
        selectedYoutube.style.height = newHeight + 'px';

        // wrapper 크기도 업데이트
        const wrapper = selectedYoutube.parentElement;
        if (wrapper && wrapper.classList.contains('youtube-wrapper')) {
          wrapper.style.width = newWidth + 'px';
          wrapper.style.height = newHeight + 'px';
        }

        // 편집 중인 크기 업데이트
        const percentage = Math.round((newWidth / parentWidth) * 100);
        if (percentage >= 95) {
          setEditYoutubeWidth('100%');
        } else if (percentage >= 70 && percentage <= 80) {
          setEditYoutubeWidth('75%');
        } else if (percentage >= 45 && percentage <= 55) {
          setEditYoutubeWidth('50%');
        } else {
          setEditYoutubeWidth(`${percentage}%`);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeStartData(null);
      if (selectedImage) {
        setEditImageWidth(selectedImage.style.width);
      }
      if (selectedYoutube) {
        // 유튜브 크기는 이미 px로 설정되어 있으므로,
        // 편집창의 width 값만 업데이트 (실제 DOM은 변경하지 않음)
        const currentWidth = selectedYoutube.style.width;
        setEditYoutubeWidth(currentWidth);

        // 변경된 크기를 새로운 원본으로 설정 (선택 해제 시 이 크기로 복원됨)
        selectedYoutube.dataset.originalWidth = currentWidth;
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeStartData, selectedImage, selectedYoutube]);

  // 스크롤, 리사이즈 및 이미지/유튜브 드래그 시 편집창 숨기기
  useEffect(() => {
    if (!selectedImage && !selectedYoutube) return;

    // 스크롤 이벤트 핸들러
    const handleScroll = () => {
      if (isImageEditPopupOpen) {
        setIsImageEditPopupOpen(false);
      }
      if (isYoutubeEditPopupOpen) {
        setIsYoutubeEditPopupOpen(false);
      }
    };

    // 리사이즈 이벤트 핸들러
    const handleResize = () => {
      if (isImageEditPopupOpen) {
        setIsImageEditPopupOpen(false);
      }
      if (isYoutubeEditPopupOpen) {
        setIsYoutubeEditPopupOpen(false);
      }
    };

    // 드래그 시작 이벤트 핸들러
    const handleDragStart = (e: DragEvent) => {
      if (e.target === selectedImage && selectedImage) {
        setIsImageEditPopupOpen(false);
        // 드래그 효과를 'move'로 설정하여 복제가 아닌 이동으로 동작하도록 함
        e.dataTransfer!.effectAllowed = 'move';
        e.dataTransfer!.dropEffect = 'move';
        // wrapper를 숨겨서 드래그 중 핸들이 보이지 않도록 함 (DOM 조작은 dragend에서 수행)
        const wrapper = selectedImage.parentElement;
        if (wrapper && wrapper.classList.contains('image-wrapper')) {
          wrapper.style.border = 'none';
          const handles = wrapper.querySelectorAll('.resize-handle');
          handles.forEach((handle) => {
            (handle as HTMLElement).style.display = 'none';
          });
        }
      }
      if (e.target === selectedYoutube && selectedYoutube) {
        setIsYoutubeEditPopupOpen(false);
        // 드래그 효과를 'move'로 설정하여 복제가 아닌 이동으로 동작하도록 함
        e.dataTransfer!.effectAllowed = 'move';
        e.dataTransfer!.dropEffect = 'move';
        // wrapper를 숨겨서 드래그 중 핸들이 보이지 않도록 함 (DOM 조작은 dragend에서 수행)
        const wrapper = selectedYoutube.parentElement;
        if (wrapper && wrapper.classList.contains('youtube-wrapper')) {
          wrapper.style.border = 'none';
          const handles = wrapper.querySelectorAll('.resize-handle');
          handles.forEach((handle) => {
            (handle as HTMLElement).style.display = 'none';
          });
        }
      }
    };

    // 드래그 종료 이벤트 핸들러 - 이미지/유튜브 이동 후 선택 해제
    const handleDragEnd = () => {
      // 드래그 완료 후 wrapper를 제거하여 선택 해제
      if (selectedImage) {
        deselectImage();
      }
      if (selectedYoutube) {
        deselectYoutube();
      }
    };

    // 이벤트 리스너 등록
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    editorRef.current?.addEventListener('scroll', handleScroll);
    containerRef.current?.addEventListener('resize', handleResize);

    if (selectedImage) {
      selectedImage.addEventListener('dragstart', handleDragStart);
      selectedImage.addEventListener('dragend', handleDragEnd);
      // 이미지에 draggable 속성 추가
      selectedImage.draggable = true;
    }

    if (selectedYoutube) {
      selectedYoutube.addEventListener('dragstart', handleDragStart);
      selectedYoutube.addEventListener('dragend', handleDragEnd);
      // 유튜브에 draggable 속성 추가
      selectedYoutube.draggable = true;
    }

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
      editorRef.current?.removeEventListener('scroll', handleScroll);
      containerRef.current?.removeEventListener('resize', handleResize);
      if (selectedImage) {
        selectedImage.removeEventListener('dragstart', handleDragStart);
        selectedImage.removeEventListener('dragend', handleDragEnd);
        selectedImage.draggable = false;
      }
      if (selectedYoutube) {
        selectedYoutube.removeEventListener('dragstart', handleDragStart);
        selectedYoutube.removeEventListener('dragend', handleDragEnd);
        selectedYoutube.draggable = false;
      }
    };
  }, [selectedImage, selectedYoutube, isImageEditPopupOpen, isYoutubeEditPopupOpen]);

  // DOM Mutation Observer - 선택된 이미지가 DOM에서 제거되는 것을 감지
  useEffect(() => {
    if (!selectedImage || !editorRef.current) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // 제거된 노드들 확인
        mutation.removedNodes.forEach((node) => {
          // 제거된 노드가 선택된 이미지이거나 그것을 포함하는 경우
          if (node === selectedImage ||
              (node.nodeType === Node.ELEMENT_NODE &&
               (node as Element).contains(selectedImage))) {
            // 선택 상태 해제
            deselectImage();
          }
        });
      });
    });

    // 에디터 관찰 시작
    observer.observe(editorRef.current, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
    };
  }, [selectedImage]);

  // DOM Mutation Observer - 선택된 유튜브가 DOM에서 제거되는 것을 감지
  useEffect(() => {
    if (!selectedYoutube || !editorRef.current) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // 제거된 노드들 확인
        mutation.removedNodes.forEach((node) => {
          // 제거된 노드가 선택된 유튜브이거나 그것을 포함하는 경우
          if (node === selectedYoutube ||
              (node.nodeType === Node.ELEMENT_NODE &&
               (node as Element).contains(selectedYoutube))) {
            // 선택 상태 해제
            deselectYoutube();
          }
        });
      });
    });

    // 에디터 관찰 시작
    observer.observe(editorRef.current, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
    };
  }, [selectedYoutube]);

  // 외부에서 value가 변경되면 히스토리 초기화 (단, undo/redo 중에는 제외)
  useEffect(() => {
    if (isUndoRedoRef.current) {
      return;
    }
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
      setHistory([value]);
      setHistoryIndex(0);
    }
  }, [value]);

  // 초기 로드 시 문단 형식 감지 (기본 p 태그는 추가하지 않음)
  useEffect(() => {
    // 약간의 지연을 주어 DOM이 완전히 렌더링된 후 감지
    const timer = setTimeout(() => {
      if (editorRef.current && editorRef.current.innerHTML) {
        // 내용이 있을 때만 문단 형식 감지
        detectCurrentParagraphStyle();
        detectCurrentAlign();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`${styles.editor} ${statusClass}`} style={{ width, position: 'relative' }}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarGroup}>
          <button
            type="button"
            className={styles.toolbarButton}
            onClick={() => execCommand('undo')}
            disabled={historyIndex <= 0}
            title="실행 취소"
            style={{
              opacity: historyIndex <= 0 ? 0.65 : 1,
              backgroundColor: 'transparent',
              border: 'none',
              cursor: historyIndex <= 0 ? 'not-allowed' : 'pointer'
            }}
          >
            <i className={styles.undo} />
          </button>
          <button
            type="button"
            className={styles.toolbarButton}
            onClick={() => execCommand('redo')}
            disabled={historyIndex >= history.length - 1}
            title="다시 실행"
            style={{
              opacity: historyIndex >= history.length - 1 ? 0.65 : 1,
              backgroundColor: 'transparent',
              border: 'none',
              cursor: historyIndex >= history.length - 1 ? 'not-allowed' : 'pointer'
            }}
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
            <div
              className={styles.paragraphDropdown}
              style={{
                top: paragraphButtonRef.current?.getBoundingClientRect().bottom ?? 0,
                left: paragraphButtonRef.current?.getBoundingClientRect().left ?? 0
              }}
            >
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
            className={styles.toolbarButton}
            onClick={() => execCommand('bold')}
            title="굵게"
          >
            <i className={styles.bold} />
          </button>
          <button
            type="button"
            className={styles.toolbarButton}
            onClick={() => execCommand('italic')}
            title="기울임"
          >
            <i className={styles.italic} />
          </button>
          <button
            type="button"
            className={styles.toolbarButton}
            onClick={() => execCommand('underline')}
            title="밑줄"
          >
            <i className={styles.underline} />
          </button>
          <button
            type="button"
            className={styles.toolbarButton}
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
              <div
                className={styles.colorPalette}
                style={{
                  top: textColorButtonRef.current?.getBoundingClientRect().bottom ?? 0,
                  left: textColorButtonRef.current?.getBoundingClientRect().left ?? 0
                }}
              >
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
              <div
                className={styles.colorPalette}
                style={{
                  top: bgColorButtonRef.current?.getBoundingClientRect().bottom ?? 0,
                  left: bgColorButtonRef.current?.getBoundingClientRect().left ?? 0
                }}
              >
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
              <div
                className={styles.alignDropdown}
                style={{
                  top: alignButtonRef.current?.getBoundingClientRect().bottom ?? 0,
                  left: alignButtonRef.current?.getBoundingClientRect().left ?? 0
                }}
              >
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
          <div ref={linkButtonRef} style={{ position: 'relative' }}>
            <button
              type="button"
              className={styles.toolbarButton}
              onClick={openLinkDropdown}
              title="링크"
            >
              <i className={styles.link} />
            </button>

            {isLinkDropdownOpen && (
              <div
                className={styles.linkDropdown}
                style={{
                  top: linkButtonRef.current?.getBoundingClientRect().bottom ?? 0,
                  left: linkButtonRef.current?.getBoundingClientRect().left ?? 0
                }}
              >
                <div className={styles.linkInput}>
                  <label>URL</label>
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://..."
                    autoFocus
                  />
                </div>
                <div className={styles.linkTarget}>
                  <label>
                    <input
                      type="radio"
                      value="_blank"
                      checked={linkTarget === '_blank'}
                      onChange={(e) => setLinkTarget(e.target.value)}
                    />
                    새 창에서 열기
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="_self"
                      checked={linkTarget === '_self'}
                      onChange={(e) => setLinkTarget(e.target.value)}
                    />
                    현재 창에서 열기
                  </label>
                </div>
                <div className={styles.linkActions}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLinkDropdownOpen(false);
                      setLinkUrl('');
                      setLinkTarget('_blank');
                      setSavedSelection(null);
                    }}
                    className={styles.default}
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={applyLink}
                    disabled={!linkUrl}
                    className={styles.primary}
                  >
                    삽입
                  </button>
                </div>
              </div>
            )}
          </div>

          <div ref={imageButtonRef} style={{ position: 'relative' }}>
            <button
              type="button"
              className={styles.toolbarButton}
              onClick={openImageDropdown}
              title="이미지"
            >
              <i className={styles.image} />
            </button>

            {isImageDropdownOpen && (
              <div
                className={styles.imageDropdown}
                style={{
                  top: imageButtonRef.current?.getBoundingClientRect().bottom ?? 0,
                  left: imageButtonRef.current?.getBoundingClientRect().left ?? 0
                }}
              >
                <div className={styles.imageTabSection}>
                  <div className={styles.imageTabButtons}>
                    <button
                      type="button"
                      className={imageTabMode === 'file' ? styles.active : ''}
                      onClick={() => {
                        setImageTabMode('file');
                        setImageUrl(''); // URL 초기화
                      }}
                    >
                      파일 업로드
                    </button>
                    <button
                      type="button"
                      className={imageTabMode === 'url' ? styles.active : ''}
                      onClick={() => {
                        setImageTabMode('url');
                        setImageFile(null); // 파일 초기화
                        setImagePreview(''); // 프리뷰 초기화
                      }}
                    >
                      URL 입력
                    </button>
                  </div>

                  {/* 파일 업로드 탭 */}
                  {imageTabMode === 'file' && (
                    <div className={styles.imageFileSection}>
                      <input
                        ref={imageFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileSelect}
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        onClick={() => imageFileInputRef.current?.click()}
                        className={styles.fileSelectButton}
                      >
                        {imageFile ? imageFile.name : '파일 선택'}
                      </button>
                      {imagePreview && (
                        <div className={styles.imagePreviewBox}>
                          <img src={imagePreview} alt="Preview" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* URL 입력 탭 */}
                  {imageTabMode === 'url' && (
                    <div className={styles.imageUrlSection}>
                      <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => {
                          setImageUrl(e.target.value);
                        }}
                        placeholder="https://..."
                      />
                    </div>
                  )}
                </div>

                <div className={styles.imageOptions}>
                  <div className={styles.imageOptionRow}>
                    <label>크기</label>
                    <div className={styles.imageSizeButtons}>
                      <button
                        type="button"
                        className={imageWidth === '100%' ? styles.active : ''}
                        onClick={() => setImageWidth('100%')}
                      >
                        100%
                      </button>
                      <button
                        type="button"
                        className={imageWidth === '75%' ? styles.active : ''}
                        onClick={() => setImageWidth('75%')}
                      >
                        75%
                      </button>
                      <button
                        type="button"
                        className={imageWidth === '50%' ? styles.active : ''}
                        onClick={() => setImageWidth('50%')}
                      >
                        50%
                      </button>
                      <button
                        type="button"
                        className={imageWidth === 'original' ? styles.active : ''}
                        onClick={() => setImageWidth('original')}
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
                        className={imageAlign === 'left' ? styles.active : ''}
                        onClick={() => setImageAlign('left')}
                        title="왼쪽 정렬"
                      >
                        <i className={styles.alignLeft} />
                      </button>
                      <button
                        type="button"
                        className={imageAlign === 'center' ? styles.active : ''}
                        onClick={() => setImageAlign('center')}
                        title="가운데 정렬"
                      >
                        <i className={styles.alignCenter} />
                      </button>
                      <button
                        type="button"
                        className={imageAlign === 'right' ? styles.active : ''}
                        onClick={() => setImageAlign('right')}
                        title="오른쪽 정렬"
                      >
                        <i className={styles.alignRight} />
                      </button>
                    </div>
                  </div>

                  <div className={styles.imageOptionRow}>
                    <label>대체 텍스트</label>
                    <input
                      type="text"
                      value={imageAlt}
                      onChange={(e) => setImageAlt(e.target.value)}
                      placeholder="이미지 설명..."
                    />
                  </div>
                </div>

                <div className={styles.imageActions}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsImageDropdownOpen(false);
                      setImageTabMode('file'); // 탭 모드 초기화
                      setImageUrl('');
                      setImageFile(null);
                      setImagePreview('');
                      setImageWidth('original'); // 원본으로 초기화
                      setImageAlign('left'); // 좌측으로 초기화
                      setImageAlt('');
                      setSavedImageSelection(null); // 저장된 선택 영역 초기화
                    }}
                    className={styles.default}
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={insertImage}
                    disabled={!imageUrl && !imageFile}
                    className={styles.primary}
                  >
                    삽입
                  </button>
                </div>
              </div>
            )}
          </div>

          <div ref={youtubeButtonRef} style={{ position: 'relative' }}>
            <button
              type="button"
              className={styles.toolbarButton}
              onClick={(e) => {
                e.stopPropagation();
                // 현재 선택 영역 저장
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                  const range = selection.getRangeAt(0).cloneRange();
                  setSavedYoutubeSelection(range);
                } else {
                  setSavedYoutubeSelection(null);
                }

                setIsYoutubeDropdownOpen(true);
                setIsImageDropdownOpen(false);
                setIsParagraphDropdownOpen(false);
                setIsTextColorOpen(false);
                setIsBgColorOpen(false);
                setIsAlignDropdownOpen(false);
                setIsLinkDropdownOpen(false);
              }}
              title="유튜브"
            >
              <i className={styles.youtube} />
            </button>

            {isYoutubeDropdownOpen && (
              <div
                className={styles.imageDropdown}
                style={{
                  top: youtubeButtonRef.current?.getBoundingClientRect().bottom ?? 0,
                  left: youtubeButtonRef.current?.getBoundingClientRect().left ?? 0
                }}
              >
                <div className={styles.imageTabSection}>
                  <div className={styles.imageTabButtons}>
                    <button
                      type="button"
                      className={styles.active}
                      style={{ width: '100%' }}
                    >
                      유튜브 URL
                    </button>
                  </div>

                  <div className={styles.imageUrlSection}>
                    <input
                      type="text"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=... 또는 https://youtu.be/..."
                      autoFocus
                    />
                  </div>
                </div>

                  <div className={styles.imageOptions}>
                    <div className={styles.imageOptionRow}>
                      <label>크기</label>
                      <div className={styles.imageSizeButtons}>
                        <button
                          type="button"
                          className={youtubeWidth === '100%' ? styles.active : ''}
                          onClick={() => setYoutubeWidth('100%')}
                        >
                          100%
                        </button>
                        <button
                          type="button"
                          className={youtubeWidth === '75%' ? styles.active : ''}
                          onClick={() => setYoutubeWidth('75%')}
                        >
                          75%
                        </button>
                        <button
                          type="button"
                          className={youtubeWidth === '50%' ? styles.active : ''}
                          onClick={() => setYoutubeWidth('50%')}
                        >
                          50%
                        </button>
                        <button
                          type="button"
                          className={youtubeWidth === 'original' ? styles.active : ''}
                          onClick={() => setYoutubeWidth('original')}
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
                          className={youtubeAlign === 'left' ? styles.active : ''}
                          onClick={() => setYoutubeAlign('left')}
                          title="왼쪽 정렬"
                        >
                          <i className={styles.alignLeft} />
                        </button>
                        <button
                          type="button"
                          className={youtubeAlign === 'center' ? styles.active : ''}
                          onClick={() => setYoutubeAlign('center')}
                          title="가운데 정렬"
                        >
                          <i className={styles.alignCenter} />
                        </button>
                        <button
                          type="button"
                          className={youtubeAlign === 'right' ? styles.active : ''}
                          onClick={() => setYoutubeAlign('right')}
                          title="오른쪽 정렬"
                        >
                          <i className={styles.alignRight} />
                        </button>
                      </div>
                    </div>
                  </div>

                <div className={styles.imageActions}>
                  <button
                    type="button"
                    className={styles.default}
                    onClick={() => {
                      setIsYoutubeDropdownOpen(false);
                      setYoutubeUrl('');
                      setYoutubeWidth('100%');
                      setYoutubeAlign('center');
                      setSavedYoutubeSelection(null);
                    }}
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    className={styles.primary}
                    onClick={() => insertYoutube()}
                    disabled={!youtubeUrl}
                  >
                    삽입
                  </button>
                </div>
              </div>
            )}
          </div>
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

        <div className={styles.toolbarGroup}>
          <button
            type="button"
            className={`${styles.toolbarButton} ${isCodeView ? styles.active : ''}`}
            onClick={toggleCodeView}
            title={isCodeView ? "에디터로 전환" : "HTML 코드보기"}
          >
            <i className={styles.code} />
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className={`${styles.editorContainer} ${resizable ? styles.resizable : ''}`}
        style={{
          height: height === 'contents' ? 'auto' : (height || '300px'),
          minHeight: minHeight || (height === 'contents' ? '100px' : '200px'),
          maxHeight: maxHeight || (height === 'contents' ? undefined : undefined),
          display: 'flex',
          flexDirection: 'column',
          resize: resizable ? 'vertical' : 'none',
          overflow: 'auto'
        }}
      >
        {isCodeView ? (
          <textarea
            ref={codeEditorRef}
            className={styles.codeEditor}
            value={codeContent}
            onChange={handleCodeChange}
            spellCheck={false}
            style={{
              flex: height === 'contents' ? '0 0 auto' : 1,
              minHeight: height === 'contents' ? 'auto' : 0,
              height: height === 'contents' && savedEditorHeight ? `${savedEditorHeight}px` : undefined,
              resize: 'none'
            }}
            placeholder={placeholder}
          />
        ) : (
          <div
            ref={editorRef}
            id={editorID}
            className={styles.editorContent}
            contentEditable
            onInput={handleInput}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            onPaste={handlePaste}
            onClick={handleEditorClick}
            onKeyUp={() => {
              detectCurrentParagraphStyle();
              detectCurrentAlign();
            }}
            onKeyDown={handleKeyDown}
            style={{
              flex: height === 'contents' ? '0 0 auto' : 1,
              minHeight: height === 'contents' ? 'auto' : 0,
              overflowY: height === 'contents' ? 'visible' : 'auto'
            }}
            data-placeholder={placeholder}
          />
        )}
      </div>

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

      {/* 링크 수정 팝업 */}
      {isEditLinkPopupOpen && selectedLinkElement && (
        <div
          className={styles.editLinkPopup}
          style={{
            position: 'absolute',
            top: selectedLinkElement.offsetTop + selectedLinkElement.offsetHeight + 5,
            left: selectedLinkElement.offsetLeft
          }}
        >
          <div className={styles.editLinkContent}>
            <div className={styles.editLinkInput}>
              <label>URL 수정</label>
              <input
                type="text"
                value={editLinkUrl}
                onChange={(e) => setEditLinkUrl(e.target.value)}
                placeholder="https://..."
                autoFocus
              />
            </div>
            <div className={styles.editLinkTarget}>
              <label>
                <input
                  type="radio"
                  value="_blank"
                  checked={editLinkTarget === '_blank'}
                  onChange={(e) => setEditLinkTarget(e.target.value)}
                />
                새 창에서 열기
              </label>
              <label>
                <input
                  type="radio"
                  value="_self"
                  checked={editLinkTarget === '_self'}
                  onChange={(e) => setEditLinkTarget(e.target.value)}
                />
                현재 창에서 열기
              </label>
            </div>
            <div className={styles.editLinkActions}>
              <button
                type="button"
                onClick={removeLink}
                className={styles.danger}
              >
                링크 삭제
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditLinkPopupOpen(false);
                    setSelectedLinkElement(null);
                    setEditLinkUrl('');
                    setEditLinkTarget('_self');
                  }}
                  className={styles.default}
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={updateLink}
                  disabled={!editLinkUrl}
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
      {isImageEditPopupOpen && selectedImage && (() => {
        // 이미지의 wrapper를 찾기 (wrapper가 있으면 wrapper 기준, 없으면 이미지 기준)
        const imageWrapper = selectedImage.parentElement?.classList.contains('image-wrapper')
          ? selectedImage.parentElement
          : selectedImage;

        return (
          <div
            className={styles.imageDropdown}
            style={{
              position: 'fixed',
              top: imageWrapper.getBoundingClientRect().bottom + 10,
              left: Math.max(10, Math.min(
                imageWrapper.getBoundingClientRect().left + (imageWrapper.getBoundingClientRect().width / 2) - 180,
                window.innerWidth - 370
              )),
              zIndex: 9999,
              minWidth: '360px',
              maxWidth: '90%'
            }}
          >
          <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: '600' }}>이미지 편집</h3>

          <div className={styles.imageOptions} style={{ marginBottom: '0' }}>
            <div className={styles.imageOptionRow}>
              <label>크기</label>
              <div className={styles.imageSizeButtons}>
                <button
                  type="button"
                  onClick={() => setEditImageWidth('100%')}
                  className={editImageWidth === '100%' ? styles.active : ''}
                >
                  100%
                </button>
                <button
                  type="button"
                  onClick={() => setEditImageWidth('75%')}
                  className={editImageWidth === '75%' ? styles.active : ''}
                >
                  75%
                </button>
                <button
                  type="button"
                  onClick={() => setEditImageWidth('50%')}
                  className={editImageWidth === '50%' ? styles.active : ''}
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={() => setEditImageWidth('original')}
                  className={editImageWidth === 'original' ? styles.active : ''}
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
                  onClick={() => setEditImageAlign('left')}
                  title="왼쪽 정렬"
                  className={editImageAlign === 'left' ? styles.active : ''}
                >
                  <i className={styles.alignLeft} />
                </button>
                <button
                  type="button"
                  onClick={() => setEditImageAlign('center')}
                  title="가운데 정렬"
                  className={editImageAlign === 'center' ? styles.active : ''}
                >
                  <i className={styles.alignCenter} />
                </button>
                <button
                  type="button"
                  onClick={() => setEditImageAlign('right')}
                  title="오른쪽 정렬"
                  className={editImageAlign === 'right' ? styles.active : ''}
                >
                  <i className={styles.alignRight} />
                </button>
              </div>
            </div>

            <div className={styles.imageOptionRow}>
              <label>대체 텍스트</label>
              <input
                type="text"
                value={editImageAlt}
                onChange={(e) => setEditImageAlt(e.target.value)}
                placeholder="이미지 설명..."
              />
            </div>
          </div>

          <div className={styles.imageActions}>
            <button
              type="button"
              onClick={deleteImage}
              className={styles.danger}
            >
              삭제
            </button>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={deselectImage}
                className={styles.default}
              >
                취소
              </button>
              <button
                type="button"
                onClick={applyImageEdit}
                className={styles.primary}
              >
                적용
              </button>
            </div>
          </div>
        </div>
      )})()}

      {/* 유튜브 편집 팝업 */}
      {isYoutubeEditPopupOpen && selectedYoutube && (() => {
        // 유튜브의 wrapper를 찾기
        const youtubeWrapper = selectedYoutube.parentElement?.classList.contains('youtube-wrapper')
          ? selectedYoutube.parentElement
          : selectedYoutube;

        return (
          <div
            className={styles.imageDropdown}
            style={{
              position: 'fixed',
              top: youtubeWrapper.getBoundingClientRect().bottom + 10,
              left: Math.max(10, Math.min(
                youtubeWrapper.getBoundingClientRect().left + (youtubeWrapper.getBoundingClientRect().width / 2) - 180,
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
                    onClick={() => setEditYoutubeWidth('100%')}
                    className={editYoutubeWidth === '100%' ? styles.active : ''}
                  >
                    100%
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditYoutubeWidth('75%')}
                    className={editYoutubeWidth === '75%' ? styles.active : ''}
                  >
                    75%
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditYoutubeWidth('50%')}
                    className={editYoutubeWidth === '50%' ? styles.active : ''}
                  >
                    50%
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditYoutubeWidth('original')}
                    className={editYoutubeWidth === 'original' ? styles.active : ''}
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
                    onClick={() => setEditYoutubeAlign('left')}
                    title="왼쪽 정렬"
                    className={editYoutubeAlign === 'left' ? styles.active : ''}
                  >
                    <i className={styles.alignLeft} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditYoutubeAlign('center')}
                    title="가운데 정렬"
                    className={editYoutubeAlign === 'center' ? styles.active : ''}
                  >
                    <i className={styles.alignCenter} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditYoutubeAlign('right')}
                    title="오른쪽 정렬"
                    className={editYoutubeAlign === 'right' ? styles.active : ''}
                  >
                    <i className={styles.alignRight} />
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.imageActions}>
              <button
                type="button"
                className={styles.danger}
                onClick={deleteYoutube}
              >
                삭제
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className={styles.default}
                  onClick={deselectYoutube}
                >
                  취소
                </button>
                <button
                  type="button"
                  className={styles.primary}
                  onClick={applyYoutubeEdit}
                >
                  적용
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  );
};

export default Editor;
