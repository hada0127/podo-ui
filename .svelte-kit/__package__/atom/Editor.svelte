<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { z } from 'zod';
  import { createValidation } from '../stores/validation';
  import styles from '../../react/atom/editor.module.scss';

  export type ToolbarItem =
    | 'undo-redo'
    | 'paragraph'
    | 'text-style'
    | 'color'
    | 'align'
    | 'list'
    | 'table'
    | 'link'
    | 'image'
    | 'youtube'
    | 'hr'
    | 'format'
    | 'code';

  interface Props {
    /** HTML content */
    value?: string;
    /** Editor width */
    width?: string;
    /** Editor height */
    height?: string | 'contents';
    /** Minimum height */
    minHeight?: string;
    /** Maximum height */
    maxHeight?: string;
    /** Allow resizing */
    resizable?: boolean;
    /** Change handler */
    onchange?: (content: string) => void;
    /** Zod validator */
    validator?: z.ZodType<unknown>;
    /** Placeholder text */
    placeholder?: string;
    /** Toolbar items to show */
    toolbar?: ToolbarItem[];
    /** Additional class name */
    class?: string;
  }

  let {
    value = $bindable(''),
    width = '100%',
    height = '400px',
    minHeight,
    maxHeight,
    resizable = false,
    onchange,
    validator,
    placeholder = '내용을 입력하세요...',
    toolbar,
    class: className = '',
    ...rest
  }: Props & Record<string, unknown> = $props();

  const { message, statusClass, validate } = createValidation(validator);

  // State
  let currentParagraphStyle = $state('p');
  let isParagraphDropdownOpen = $state(false);
  let isTextColorOpen = $state(false);
  let isBgColorOpen = $state(false);
  let isAlignDropdownOpen = $state(false);
  let currentAlign = $state('left');

  // Text style states
  let isBold = $state(false);
  let isItalic = $state(false);
  let isUnderline = $state(false);
  let isStrikethrough = $state(false);
  let isLinkDropdownOpen = $state(false);
  let linkUrl = $state('');
  let linkTarget = $state('_blank');
  let isEditLinkPopupOpen = $state(false);
  let selectedLinkElement = $state<HTMLAnchorElement | null>(null);
  let editLinkUrl = $state('');
  let editLinkTarget = $state('_self');
  let savedSelection = $state<Range | null>(null);
  let isImageDropdownOpen = $state(false);
  let imageTabMode = $state<'file' | 'url'>('file');
  let imageUrl = $state('');
  let imageWidth = $state('original');
  let imageAlign = $state('left');
  let imageAlt = $state('');
  let imageFile = $state<File | null>(null);
  let imagePreview = $state('');
  let savedImageSelection = $state<Range | null>(null);
  let selectedImage = $state<HTMLImageElement | null>(null);
  let isImageEditPopupOpen = $state(false);
  let editImageWidth = $state('');
  let editImageAlign = $state('left');
  let editImageAlt = $state('');
  let isResizing = $state(false);
  let resizeStartData = $state<{ startX: number; startY: number; startWidth: number; startHeight: number; handle: string } | null>(null);

  // YouTube state
  let isYoutubeDropdownOpen = $state(false);
  let youtubeUrl = $state('');
  let savedYoutubeSelection = $state<Range | null>(null);
  let youtubeWidth = $state('100%');
  let youtubeAlign = $state('center');
  let selectedYoutube = $state<HTMLElement | null>(null);
  let isYoutubeEditPopupOpen = $state(false);
  let editYoutubeWidth = $state('100%');
  let editYoutubeAlign = $state('center');
  let isCodeView = $state(false);
  let codeContent = $state('');
  let originalHtml = $state('');
  let savedEditorHeight = $state<number | null>(null);

  // Undo/Redo history
  let history = $state<string[]>([value]);
  let historyIndex = $state(0);
  let historyTimer: ReturnType<typeof setTimeout> | null = null;
  let isUndoRedo = false;
  let isComposing = false;
  let justComposed = false;

  // Table state
  let isTableDropdownOpen = $state(false);
  let tableRows = $state(0);
  let tableCols = $state(0);
  let savedTableSelection = $state<Range | null>(null);
  let isTableContextMenuOpen = $state(false);
  let tableContextMenuPosition = $state({ x: 0, y: 0 });
  let selectedTableCell = $state<HTMLTableCellElement | null>(null);
  let isTableCellColorOpen = $state(false);
  let selectedTableCells = $state<HTMLTableCellElement[]>([]);
  let selectionStartCell: HTMLTableCellElement | null = null;
  let isSelectingCells = false;
  let justFinishedDragging = false;
  let isMouseDown = false;

  // Refs
  let editorRef = $state<HTMLDivElement | null>(null);
  let codeEditorRef = $state<HTMLTextAreaElement | null>(null);
  let containerRef = $state<HTMLDivElement | null>(null);
  let fileInputRef = $state<HTMLInputElement | null>(null);
  let imageFileInputRef = $state<HTMLInputElement | null>(null);
  let tableContextMenuRef = $state<HTMLDivElement | null>(null);
  let imageButtonRef = $state<HTMLDivElement | null>(null);
  let youtubeButtonRef = $state<HTMLDivElement | null>(null);
  let textColorButtonRef = $state<HTMLDivElement | null>(null);
  let bgColorButtonRef = $state<HTMLDivElement | null>(null);
  let alignButtonRef = $state<HTMLDivElement | null>(null);
  let paragraphButtonRef = $state<HTMLDivElement | null>(null);
  let linkButtonRef = $state<HTMLDivElement | null>(null);
  let tableButtonRef = $state<HTMLDivElement | null>(null);

  // Dropdown position state
  let imageDropdownPos = $state({ top: 0, left: 0 });
  let youtubeDropdownPos = $state({ top: 0, left: 0 });
  let textColorDropdownPos = $state({ top: 0, left: 0 });
  let bgColorDropdownPos = $state({ top: 0, left: 0 });
  let alignDropdownPos = $state({ top: 0, left: 0 });
  let paragraphDropdownPos = $state({ top: 0, left: 0 });
  let linkDropdownPos = $state({ top: 0, left: 0 });
  let tableDropdownPos = $state({ top: 0, left: 0 });

  let editorID = $state(`podo-editor-${Math.random().toString(36).slice(2, 9)}`);

  // Toolbar config
  const defaultToolbar: ToolbarItem[] = [
    'undo-redo', 'paragraph', 'text-style', 'color', 'align', 'list',
    'table', 'link', 'image', 'youtube', 'hr', 'format', 'code',
  ];
  const activeToolbar = $derived(toolbar || defaultToolbar);

  const isToolbarItemEnabled = (item: ToolbarItem) => activeToolbar.includes(item);

  // Color palette
  const colorPalette = [
    ['#ff0000', '#ff8000', '#ffff00', '#80ff00', '#00ffff', '#0080ff', '#0000ff', '#8000ff', '#ff00ff', '#ffffff', '#000000'],
    ['#ffcccc', '#ffe0cc', '#ffffcc', '#e0ffcc', '#ccffff', '#cce0ff', '#ccccff', '#e0ccff', '#ffccff', '#f5f5f5', '#cccccc'],
    ['#ff9999', '#ffcc99', '#ffff99', '#ccff99', '#99ffff', '#99ccff', '#9999ff', '#cc99ff', '#ff99ff', '#e6e6e6', '#999999'],
    ['#ff6666', '#ffb366', '#ffff66', '#b3ff66', '#66ffff', '#66b3ff', '#6666ff', '#b366ff', '#ff66ff', '#d9d9d9', '#666666'],
    ['#cc0000', '#cc6600', '#cccc00', '#66cc00', '#00cccc', '#0066cc', '#0000cc', '#6600cc', '#cc00cc', '#b3b3b3', '#333333'],
    ['#800000', '#804000', '#808000', '#408000', '#008080', '#004080', '#000080', '#400080', '#800080', '#808080', '#1a1a1a'],
  ];

  // Align options
  const alignOptions = [
    { value: 'left', label: '왼쪽 정렬', icon: 'alignLeft' },
    { value: 'center', label: '가운데 정렬', icon: 'alignCenter' },
    { value: 'right', label: '오른쪽 정렬', icon: 'alignRight' },
  ];

  // Paragraph options
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

  const getCurrentStyleLabel = () => {
    const option = paragraphOptions.find(opt => opt.value === currentParagraphStyle);
    return option ? option.label : '문단 형식';
  };

  const getCurrentAlignLabel = () => {
    const option = alignOptions.find(opt => opt.value === currentAlign);
    return option ? option.label : '왼쪽 정렬';
  };

  const getCurrentAlignIcon = () => {
    const option = alignOptions.find(opt => opt.value === currentAlign);
    return option ? styles[option.icon] : styles.alignLeft;
  };

  const validateHandler = (content: string) => {
    if (validator) {
      validate(content);
    }
  };

  // 리사이즈 핸들과 wrapper를 제거한 깨끗한 HTML 반환
  const getCleanHTML = (html: string): string => {
    const temp = document.createElement('div');
    temp.innerHTML = html;

    // image-wrapper 제거 (이미지만 남기고)
    const imageWrappers = temp.querySelectorAll('.image-wrapper');
    imageWrappers.forEach(wrapper => {
      const img = wrapper.querySelector('img');
      if (img && wrapper.parentNode) {
        // img를 wrapper 밖으로 이동
        wrapper.parentNode.insertBefore(img, wrapper);
        wrapper.remove();
      }
    });

    // resize-handle 제거
    const resizeHandles = temp.querySelectorAll('.resize-handle');
    resizeHandles.forEach(handle => handle.remove());

    // youtube-wrapper의 resize-handle만 제거 (wrapper는 유지)
    const youtubeWrappers = temp.querySelectorAll('.youtube-wrapper');
    youtubeWrappers.forEach(wrapper => {
      const handles = wrapper.querySelectorAll('.resize-handle');
      handles.forEach(handle => handle.remove());
    });

    return temp.innerHTML;
  };

  const detectCurrentAlign = () => {
    if (document.queryCommandState('justifyLeft')) {
      currentAlign = 'left';
    } else if (document.queryCommandState('justifyCenter')) {
      currentAlign = 'center';
    } else if (document.queryCommandState('justifyRight')) {
      currentAlign = 'right';
    } else {
      currentAlign = 'left';
    }
  };

  const detectTextStyles = () => {
    isBold = document.queryCommandState('bold');
    isItalic = document.queryCommandState('italic');
    isUnderline = document.queryCommandState('underline');
    isStrikethrough = document.queryCommandState('strikeThrough');
  };

  const detectCurrentParagraphStyle = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      currentParagraphStyle = 'p';
      return;
    }

    let container: Node | null = selection.getRangeAt(0).commonAncestorContainer;
    if (container.nodeType === Node.TEXT_NODE) {
      container = container.parentNode;
    }

    while (container && container !== editorRef) {
      const element = container as Element;
      if (element.tagName) {
        const tagName = element.tagName.toLowerCase();

        if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3') {
          currentParagraphStyle = tagName;
          return;
        }

        if (tagName === 'p') {
          if (element.className) {
            const classNames = Object.keys(styles);
            for (const cls of classNames) {
              if (cls.match(/^p[1-5](_semibold)?$/) && element.classList.contains(styles[cls])) {
                currentParagraphStyle = cls;
                return;
              }
            }
          }
          currentParagraphStyle = 'p';
          return;
        }

        if (tagName === 'div' || tagName === 'blockquote' || tagName === 'pre') {
          currentParagraphStyle = 'p';
          return;
        }
      }
      container = (container as Element).parentNode;
    }

    currentParagraphStyle = 'p';
  };

  // Add to history with debounce
  const addToHistory = (content: string) => {
    if (historyTimer) {
      clearTimeout(historyTimer);
    }

    historyTimer = setTimeout(() => {
      const newHistory = history.slice(0, historyIndex + 1);

      if (newHistory[newHistory.length - 1] === content) {
        return;
      }

      const updated = [...newHistory, content];
      if (updated.length > 200) {
        updated.shift();
        history = updated;
      } else {
        history = updated;
        historyIndex = updated.length - 1;
      }
    }, 500);
  };

  // Undo
  const performUndo = () => {
    if (historyTimer) {
      clearTimeout(historyTimer);
      historyTimer = null;
    }

    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const content = history[newIndex];
      historyIndex = newIndex;

      if (editorRef) {
        isUndoRedo = true;
        editorRef.innerHTML = content;
        value = content;
        onchange?.(getCleanHTML(content));
        detectCurrentParagraphStyle();
        detectCurrentAlign();
        detectTextStyles();
        setTimeout(() => {
          isUndoRedo = false;
        }, 0);
      }
    }
  };

  // Redo
  const performRedo = () => {
    if (historyTimer) {
      clearTimeout(historyTimer);
      historyTimer = null;
    }

    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const content = history[newIndex];
      historyIndex = newIndex;

      if (editorRef) {
        isUndoRedo = true;
        editorRef.innerHTML = content;
        value = content;
        onchange?.(getCleanHTML(content));
        detectCurrentParagraphStyle();
        detectCurrentAlign();
        detectTextStyles();
        setTimeout(() => {
          isUndoRedo = false;
        }, 0);
      }
    }
  };

  const handleInput = () => {
    if (isComposing) return;

    if (justComposed) {
      justComposed = false;
      return;
    }

    if (editorRef) {
      const content = editorRef.innerHTML;
      const cleanContent = getCleanHTML(content);
      value = content;
      onchange?.(cleanContent);
      validateHandler(cleanContent);
      detectCurrentParagraphStyle();
      detectCurrentAlign();
      detectTextStyles();
      addToHistory(content);
    }
  };

  const handleCompositionStart = () => {
    isComposing = true;
  };

  const handleCompositionEnd = () => {
    isComposing = false;
    justComposed = true;

    if (editorRef) {
      const content = editorRef.innerHTML;
      const cleanContent = getCleanHTML(content);
      value = content;
      onchange?.(cleanContent);
      validateHandler(cleanContent);
      detectCurrentParagraphStyle();
      detectCurrentAlign();
      detectTextStyles();
      addToHistory(content);
    }
  };

  // Insert image into editor (simple version for drag/drop/paste)
  const insertImageAtCursor = (src: string, alt = '') => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.style.maxWidth = '100%';

    range.deleteContents();
    range.insertNode(img);

    // Move cursor after image
    const newRange = document.createRange();
    newRange.setStartAfter(img);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);

    handleInput();
  };

  // Handle image file selection
  const handleImageFileSelect = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    imageFile = file;

    const reader = new FileReader();
    reader.onload = (event) => {
      imagePreview = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Insert image with options (from toolbar)
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
          }, 5000);

          testImg.onload = () => {
            clearTimeout(timeout);
            resolve(true);
          };

          testImg.onerror = () => {
            clearTimeout(timeout);
            reject(new Error('Load failed'));
          };

          testImg.src = imageUrl;
        });

        imageSrc = imageUrl;
      } catch {
        alert(`이미지를 불러올 수 없습니다.\n\n가능한 원인:\n1. 잘못된 이미지 URL\n2. CORS 정책으로 인한 차단\n3. 네트워크 연결 문제\n\nURL: ${imageUrl}`);
        return;
      }
    }

    if (!imageSrc) return;

    // 이미지 엘리먼트 생성
    const img = document.createElement('img');
    img.src = imageSrc;
    img.alt = imageAlt || '';
    img.style.display = 'inline-block';
    img.style.verticalAlign = 'middle';

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

    // 컨테이너 div 생성 (정렬용)
    const container = document.createElement('div');
    container.style.textAlign = imageAlign;
    container.appendChild(img);

    // 에디터에 포커스 설정
    if (editorRef) {
      editorRef.focus();

      const selection = window.getSelection();

      // 저장된 선택 영역 복원
      if (savedImageSelection && selection) {
        try {
          selection.removeAllRanges();
          selection.addRange(savedImageSelection);
        } catch {
          // ignore
        }
      }

      // 선택 영역 재확인
      if (!selection || selection.rangeCount === 0 || !editorRef.contains(selection.anchorNode)) {
        if (!editorRef.innerHTML || editorRef.innerHTML === '<br>') {
          const p = document.createElement('p');
          p.innerHTML = '<br>';
          editorRef.appendChild(p);
        }

        const range = document.createRange();
        range.selectNodeContents(editorRef);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }

      // 이미지 삽입
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
        editorRef.appendChild(container);
      }
    }

    // 상태 초기화
    isImageDropdownOpen = false;
    imageTabMode = 'file';
    imageUrl = '';
    imageFile = null;
    imagePreview = '';
    imageWidth = 'original';
    imageAlign = 'left';
    imageAlt = '';
    savedImageSelection = null;

    handleInput();
  };

  // Extract YouTube video ID from URL
  const extractYoutubeVideoId = (url: string): string | null => {
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

  // Insert YouTube video
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
      container.style.width = youtubeWidth;
      container.style.aspectRatio = '16 / 9';
    } else {
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
    iframe.style.pointerEvents = 'none'; // 편집 모드에서 iframe 클릭 방지 (overlay가 클릭 캡처)

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
    if (editorRef) {
      editorRef.focus();

      const selection = window.getSelection();

      // 저장된 선택 영역 복원
      if (savedYoutubeSelection && selection) {
        try {
          selection.removeAllRanges();
          selection.addRange(savedYoutubeSelection);
        } catch {
          // ignore
        }
      }

      // 선택 영역 재확인
      if (!selection || selection.rangeCount === 0 || !editorRef.contains(selection.anchorNode)) {
        if (!editorRef.innerHTML || editorRef.innerHTML === '<br>') {
          const p = document.createElement('p');
          p.innerHTML = '<br>';
          editorRef.appendChild(p);
        }

        const range = document.createRange();
        range.selectNodeContents(editorRef);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }

      // YouTube 삽입
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(alignContainer);

        // 다음에 새 문단 추가
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
        editorRef.appendChild(alignContainer);
      }
    }

    // 상태 초기화
    isYoutubeDropdownOpen = false;
    youtubeUrl = '';
    youtubeWidth = '100%';
    youtubeAlign = 'center';
    savedYoutubeSelection = null;

    handleInput();
  };

  // Drag and drop handlers
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    // Process image files only
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          if (dataUrl) {
            // Focus editor at drop position
            editorRef?.focus();
            insertImageAtCursor(dataUrl, file.name || 'dropped-image');
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Paste handler
  const handlePaste = (e: ClipboardEvent) => {
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    // Check for image files in clipboard
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
                insertImageAtCursor(dataUrl, file.name || 'pasted-image');
              }
            };
            reader.readAsDataURL(file);
          }
          return;
        }
      }
    }

    // Check for files (drag & drop or file paste)
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
              insertImageAtCursor(dataUrl, file.name || 'pasted-image');
            }
          };
          reader.readAsDataURL(file);
          return;
        }
      }
    }

    // Handle HTML/text paste
    e.preventDefault();

    const html = clipboardData.getData('text/html');
    const text = clipboardData.getData('text/plain');

    if (html) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;

      const allowedTags = ['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'S', 'STRIKE', 'DEL',
                          'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'PRE',
                          'UL', 'OL', 'LI', 'A', 'IMG', 'SPAN', 'DIV', 'HR',
                          'TABLE', 'THEAD', 'TBODY', 'TFOOT', 'TR', 'TH', 'TD'];

      const cleanElement = (element: Element): Node | null => {
        const tagName = element.tagName;

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

        const newElement = element.cloneNode(false) as HTMLElement;
        const attrs = Array.from(element.attributes);
        attrs.forEach(attr => newElement.removeAttribute(attr.name));

        if (tagName === 'A' && element.getAttribute('href')) {
          newElement.setAttribute('href', element.getAttribute('href')!);
          if (element.getAttribute('target')) {
            newElement.setAttribute('target', element.getAttribute('target')!);
          }
        }

        if (tagName === 'IMG') {
          if (element.getAttribute('src')) {
            newElement.setAttribute('src', element.getAttribute('src')!);
          }
          if (element.getAttribute('alt')) {
            newElement.setAttribute('alt', element.getAttribute('alt')!);
          }
        }

        // Table 요소에 에디터 기본 스타일 적용 (insertTable과 동일)
        if (tagName === 'TABLE') {
          newElement.style.borderCollapse = 'collapse';
          newElement.style.width = '100%';
          newElement.style.margin = '10px 0';
          newElement.setAttribute('border', '1');
          newElement.style.border = '1px solid #ddd';
        }
        if (tagName === 'TH' || tagName === 'TD') {
          newElement.style.border = '1px solid #ddd';
          newElement.style.padding = '8px';
          if (tagName === 'TD') {
            newElement.style.minWidth = '50px';
          }
        }
        if (tagName === 'TH') {
          newElement.style.fontWeight = 'bold';
        }

        // 붙여넣기된 요소의 style 속성은 모두 제거 (위 테이블 기본 스타일만 유지)

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

      const cleanedContent = document.createDocumentFragment();
      Array.from(tempDiv.childNodes).forEach(child => {
        if (child.nodeType === Node.ELEMENT_NODE) {
          const cleaned = cleanElement(child as Element);
          if (cleaned) cleanedContent.appendChild(cleaned);
        } else if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
          cleanedContent.appendChild(child.cloneNode(true));
        }
      });

      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(cleanedContent);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    } else if (text) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();

        // 텍스트를 줄 단위로 분리 (연속된 줄바꿈은 문단 구분으로 처리)
        const lines = text.split('\n');
        const paragraphs: string[][] = [];
        let currentParagraph: string[] = [];

        lines.forEach((line) => {
          if (line.trim() === '') {
            // 빈 줄이면 현재 문단을 저장하고 새 문단 시작
            if (currentParagraph.length > 0) {
              paragraphs.push(currentParagraph);
              currentParagraph = [];
            }
          } else {
            currentParagraph.push(line);
          }
        });

        // 마지막 문단 추가
        if (currentParagraph.length > 0) {
          paragraphs.push(currentParagraph);
        }

        // 문단이 없으면 빈 문자열 처리
        if (paragraphs.length === 0) {
          range.insertNode(document.createTextNode(text));
          range.collapse(false);
          return;
        }

        const fragment = document.createDocumentFragment();

        paragraphs.forEach((paragraph) => {
          if (paragraph.length === 1) {
            // 한 줄짜리 문단은 <p> 태그로 감싸기
            const p = document.createElement('p');
            p.textContent = paragraph[0];
            fragment.appendChild(p);
          } else if (paragraph.length > 1) {
            // 여러 줄은 <p> 태그로 감싸고 내부는 <br>로 구분
            const p = document.createElement('p');
            paragraph.forEach((line, lIndex) => {
              p.appendChild(document.createTextNode(line));
              if (lIndex < paragraph.length - 1) {
                p.appendChild(document.createElement('br'));
              }
            });
            fragment.appendChild(p);
          }
        });

        range.insertNode(fragment);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }

    handleInput();
  };

  // Text formatting commands
  const execCommand = (command: string, value?: string) => {
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
    editorRef?.focus();
    handleInput();
  };

  const formatBold = () => {
    execCommand('bold');
    detectTextStyles();
  };
  const formatItalic = () => {
    execCommand('italic');
    detectTextStyles();
  };
  const formatUnderline = () => {
    execCommand('underline');
    detectTextStyles();
  };
  const formatStrikethrough = () => {
    execCommand('strikeThrough');
    detectTextStyles();
  };
  const removeFormat = () => {
    execCommand('removeFormat');
    detectTextStyles();
  };

  const applyColorStyle = (styleProperty: string, color: string) => {
    // 저장된 선택 영역 복원
    if (savedSelection) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelection);
      }
    }

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      return;
    }

    const range = selection.getRangeAt(0);

    // 선택 영역에 포함된 모든 표 셀 찾기
    const getSelectedTableCells = (): HTMLTableCellElement[] => {
      const cells: HTMLTableCellElement[] = [];
      const container = range.commonAncestorContainer;

      // 컨테이너가 표인지 확인
      let tableElement: HTMLElement | null = null;
      let current = container.nodeType === Node.TEXT_NODE ? container.parentElement : container as HTMLElement;

      while (current && current !== editorRef) {
        if (current.tagName === 'TABLE' || current.tagName === 'TBODY' || current.tagName === 'TR') {
          // 상위 table 요소 찾기
          let table = current;
          while (table && table.tagName !== 'TABLE') {
            table = table.parentElement as HTMLElement;
          }
          tableElement = table;
          break;
        }
        current = current.parentElement;
      }

      if (!tableElement) return cells;

      // 표 내의 모든 셀 확인
      const allCells = tableElement.querySelectorAll('td, th');
      allCells.forEach(cell => {
        if (range.intersectsNode(cell)) {
          cells.push(cell as HTMLTableCellElement);
        }
      });

      return cells;
    };

    const selectedCells = getSelectedTableCells();

    // 여러 표 셀이 선택된 경우
    if (selectedCells.length > 1) {
      selectedCells.forEach(cell => {
        // 각 셀의 모든 내용을 span으로 감싸기
        const cellContents = Array.from(cell.childNodes);

        cellContents.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
            // 텍스트 노드를 span으로 감싸기
            const span = document.createElement('span');
            if (styleProperty === 'color') {
              span.style.color = color;
            } else if (styleProperty === 'background-color') {
              span.style.backgroundColor = color;
            }
            span.textContent = node.textContent;
            cell.replaceChild(span, node);
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            // 기존 요소에 스타일 적용
            const element = node as HTMLElement;
            if (styleProperty === 'color') {
              element.style.color = color;
            } else if (styleProperty === 'background-color') {
              element.style.backgroundColor = color;
            }
          }
        });
      });

      // 선택 해제
      selection.removeAllRanges();
      editorRef?.focus();
      handleInput();
      return;
    }

    // 단일 셀 내부 또는 일반 텍스트
    const commonAncestor = range.commonAncestorContainer;

    // 선택 영역이 표 셀 내부인지 확인
    const isInTableCell = (node: Node): boolean => {
      let current = node.nodeType === Node.TEXT_NODE ? node.parentElement : node as Element;
      while (current && current !== editorRef) {
        if (current.tagName === 'TD' || current.tagName === 'TH') {
          return true;
        }
        current = current.parentElement;
      }
      return false;
    };

    // 표 셀 내부에서의 색상 변경 (단일 셀)
    if (isInTableCell(commonAncestor)) {
      try {
        const contents = range.extractContents();
        const span = document.createElement('span');

        if (styleProperty === 'color') {
          span.style.color = color;
        } else if (styleProperty === 'background-color') {
          span.style.backgroundColor = color;
        }

        span.appendChild(contents);
        range.insertNode(span);

        // 커서 위치 조정
        range.setStartAfter(span);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);

        editorRef?.focus();
        handleInput();
        return;
      } catch {
        // 오류 무시
      }
    }

    // 일반 텍스트에 대한 색상 변경
    const span = document.createElement('span');

    try {
      const contents = range.extractContents();

      if (styleProperty === 'color') {
        span.setAttribute('style', `color: ${color} !important;`);
      } else if (styleProperty === 'background-color') {
        span.setAttribute('style', `background-color: ${color} !important;`);
      }

      span.appendChild(contents);
      range.insertNode(span);

      range.selectNodeContents(span);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);

    } catch {
      if (styleProperty === 'color') {
        document.execCommand('foreColor', false, color);
      } else {
        document.execCommand('hiliteColor', false, color);
      }
    }

    editorRef?.focus();
    handleInput();
  };

  const setTextColor = (color: string) => {
    applyColorStyle('color', color);
    isTextColorOpen = false;
    savedSelection = null;
  };

  const setBackgroundColor = (color: string) => {
    applyColorStyle('background-color', color);
    isBgColorOpen = false;
    savedSelection = null;
  };

  const setAlignment = (align: string) => {
    if (align === 'left') execCommand('justifyLeft');
    else if (align === 'center') execCommand('justifyCenter');
    else if (align === 'right') execCommand('justifyRight');
    currentAlign = align;
    isAlignDropdownOpen = false;
  };

  const insertList = (ordered: boolean) => {
    execCommand(ordered ? 'insertOrderedList' : 'insertUnorderedList');
  };

  // Paragraph format
  const setParagraphFormat = (format: string) => {
    editorRef?.focus();
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) {
      isParagraphDropdownOpen = false;
      return;
    }

    if (format === 'h1' || format === 'h2' || format === 'h3') {
      document.execCommand('formatBlock', false, format);
    } else if (format === 'p') {
      document.execCommand('formatBlock', false, 'p');
    } else if (format.startsWith('p') && (format.match(/p[1-5](_semibold)?/))) {
      document.execCommand('formatBlock', false, 'p');

      setTimeout(() => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          let node: Node | null = sel.getRangeAt(0).startContainer;
          if (node.nodeType === Node.TEXT_NODE) {
            node = node.parentNode;
          }

          while (node && node !== editorRef) {
            if ((node as Element).tagName === 'P') {
              const p = node as HTMLParagraphElement;
              Object.keys(styles).forEach(cls => {
                if (cls.match(/^p[1-5](_semibold)?$/)) {
                  p.classList.remove(styles[cls]);
                }
              });
              p.classList.add(styles[format]);
              break;
            }
            node = node.parentNode;
          }
        }
      }, 0);
    }

    currentParagraphStyle = format;
    isParagraphDropdownOpen = false;
    handleInput();
  };

  // Link functions
  const insertLink = () => {
    if (!linkUrl.trim()) return;

    editorRef?.focus();

    if (savedSelection) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelection);
      }
    }

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();

      if (selectedText) {
        const a = document.createElement('a');
        a.href = linkUrl;
        a.target = linkTarget;
        a.textContent = selectedText;
        range.deleteContents();
        range.insertNode(a);
      } else {
        const a = document.createElement('a');
        a.href = linkUrl;
        a.target = linkTarget;
        a.textContent = linkUrl;
        range.insertNode(a);
      }
    }

    linkUrl = '';
    linkTarget = '_blank';
    savedSelection = null;
    isLinkDropdownOpen = false;
    handleInput();
  };

  // Link edit
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

      isEditLinkPopupOpen = false;
      selectedLinkElement = null;
      editorRef?.focus();
      handleInput();
    }
  };

  // Link remove
  const removeLink = () => {
    if (selectedLinkElement) {
      const parent = selectedLinkElement.parentNode;
      const textContent = selectedLinkElement.textContent || '';
      const textNode = document.createTextNode(textContent);

      parent?.replaceChild(textNode, selectedLinkElement);

      isEditLinkPopupOpen = false;
      selectedLinkElement = null;
      editorRef?.focus();
      handleInput();
    }
  };

  // HR insert
  const insertHR = () => {
    if (!editorRef) return;

    editorRef.focus();
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);

    const hr = document.createElement('hr');
    hr.style.border = 'none';
    hr.style.borderTop = '1px solid #ddd';
    hr.style.margin = '10px 0';

    const newP = document.createElement('p');
    newP.innerHTML = '<br>';

    range.deleteContents();
    range.insertNode(hr);
    hr.after(newP);

    const newRange = document.createRange();
    newRange.selectNodeContents(newP);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);

    editorRef.focus();
    handleInput();
  };

  // Table insert
  const insertTable = (rows: number, cols: number) => {
    if (rows === 0 || cols === 0) return;

    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';
    table.style.width = '100%';
    table.style.margin = '10px 0';
    table.setAttribute('border', '1');
    table.style.border = '1px solid #ddd';

    const tbody = document.createElement('tbody');

    for (let i = 0; i < rows; i++) {
      const tr = document.createElement('tr');

      for (let j = 0; j < cols; j++) {
        const td = document.createElement('td');
        td.style.border = '1px solid #ddd';
        td.style.padding = '8px';
        td.style.minWidth = '50px';
        td.innerHTML = '<br>';
        tr.appendChild(td);
      }

      tbody.appendChild(tr);
    }

    table.appendChild(tbody);

    if (editorRef) {
      editorRef.focus();

      const selection = window.getSelection();

      if (savedTableSelection && selection) {
        try {
          selection.removeAllRanges();
          selection.addRange(savedTableSelection);
        } catch {
          // ignore
        }
      }

      if (!selection || selection.rangeCount === 0 || !editorRef.contains(selection.anchorNode)) {
        if (!editorRef.innerHTML || editorRef.innerHTML === '<br>') {
          const p = document.createElement('p');
          p.innerHTML = '<br>';
          editorRef.appendChild(p);
        }

        const range = document.createRange();
        range.selectNodeContents(editorRef);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }

      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(table);

        const newP = document.createElement('p');
        newP.innerHTML = '<br>';
        table.after(newP);

        const firstCell = table.querySelector('td');
        if (firstCell) {
          const newRange = document.createRange();
          newRange.selectNodeContents(firstCell);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      } else {
        editorRef.appendChild(table);
      }
    }

    isTableDropdownOpen = false;
    tableRows = 0;
    tableCols = 0;
    savedTableSelection = null;

    editorRef?.focus();
    handleInput();
  };

  // Table context menu handler
  const handleTableContextMenu = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const cell = target.closest('td, th') as HTMLTableCellElement;

    if (cell && editorRef?.contains(cell)) {
      e.preventDefault();
      e.stopPropagation();

      // 선택된 셀이 없거나, 우클릭한 셀이 선택 영역에 포함되지 않은 경우
      if (selectedTableCells.length === 0 || !selectedTableCells.includes(cell)) {
        clearCellSelection();
        selectedTableCell = cell;
      } else {
        // 선택된 셀들 중 하나를 우클릭한 경우, 첫 번째 셀을 대표로 사용
        selectedTableCell = selectedTableCells[0];
      }

      tableContextMenuPosition = { x: e.clientX, y: e.clientY };
      isTableContextMenuOpen = true;
      isTableCellColorOpen = false;
    }
  };

  // Clear cell selection
  const clearCellSelection = () => {
    selectedTableCells.forEach(cell => cell.classList.remove('selected-cell'));
    selectedTableCells = [];
    selectionStartCell = null;
  };

  // 다중 셀 선택 범위 계산
  const getCellsInRange = (startCell: HTMLTableCellElement, endCell: HTMLTableCellElement): HTMLTableCellElement[] => {
    const table = startCell.closest('table');
    if (!table) return [];

    const tbody = table.querySelector('tbody');
    if (!tbody) return [];

    const startRow = startCell.parentElement as HTMLTableRowElement;
    const endRow = endCell.parentElement as HTMLTableRowElement;

    const startRowIndex = Array.from(tbody.rows).indexOf(startRow);
    const endRowIndex = Array.from(tbody.rows).indexOf(endRow);
    const startColIndex = startCell.cellIndex;
    const endColIndex = endCell.cellIndex;

    const minRow = Math.min(startRowIndex, endRowIndex);
    const maxRow = Math.max(startRowIndex, endRowIndex);
    const minCol = Math.min(startColIndex, endColIndex);
    const maxCol = Math.max(startColIndex, endColIndex);

    const cells: HTMLTableCellElement[] = [];
    for (let r = minRow; r <= maxRow; r++) {
      const row = tbody.rows[r];
      for (let c = minCol; c <= maxCol; c++) {
        if (row.cells[c]) {
          cells.push(row.cells[c]);
        }
      }
    }

    return cells;
  };

  // 표 셀 마우스 다운 (드래그 선택 시작)
  const handleCellMouseDown = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const cell = target.closest('td') as HTMLTableCellElement;

    if (cell && editorRef?.contains(cell)) {
      // 이미지나 이미지 컨테이너를 드래그하는 경우 셀 선택 방지
      if (target.tagName === 'IMG' || target.classList.contains('image-container')) {
        return;
      }

      // 마우스 다운 상태 설정
      isMouseDown = true;

      // 드래그 시작 셀 설정
      selectionStartCell = cell;

      // 이미 선택된 셀을 클릭한 경우 선택 유지
      const isAlreadySelected = cell.classList.contains('selected-cell');

      // 새로운 셀을 클릭하거나 Shift 키를 누르지 않은 경우에만 기존 선택 해제
      if (!isAlreadySelected && !e.shiftKey) {
        const allCells = editorRef.querySelectorAll('.selected-cell');
        allCells.forEach(c => c.classList.remove('selected-cell'));
        selectedTableCells = [];
      }
    }
  };

  // 표 셀 마우스 이동 (드래그 선택 중)
  const handleCellMouseMove = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const cell = target.closest('td') as HTMLTableCellElement;

    if (!cell || !editorRef?.contains(cell)) return;

    // 마우스가 눌려있지 않으면 드래그 불가
    if (!isMouseDown) {
      return;
    }

    // selectionStartCell이 있고, 다른 셀로 이동한 경우에만 드래그 선택 모드 활성화
    if (selectionStartCell && cell !== selectionStartCell && !isSelectingCells) {
      isSelectingCells = true;
      e.preventDefault();
      e.stopPropagation();
    }

    if (!isSelectingCells || !selectionStartCell) return;

    e.preventDefault();
    e.stopPropagation();

    // 범위 내 모든 셀 선택
    const cellsInRange = getCellsInRange(selectionStartCell, cell);

    // 기존 선택 클래스 제거
    const allSelectedCells = editorRef.querySelectorAll('.selected-cell');
    allSelectedCells.forEach(c => c.classList.remove('selected-cell'));

    // 새 선택 적용
    selectedTableCells = cellsInRange;
    cellsInRange.forEach(c => c.classList.add('selected-cell'));
  };

  // 표 셀 마우스 업 (드래그 선택 종료)
  const handleCellMouseUp = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const cell = target.closest('td') as HTMLTableCellElement;

    // 드래그 선택 중이었다면 플래그 설정
    if (isSelectingCells) {
      // 셀 내부에서 마우스 업한 경우 이벤트 방지
      if (cell && editorRef?.contains(cell)) {
        e.preventDefault();
        e.stopPropagation();
      }

      // 드래그가 방금 끝났음을 표시
      justFinishedDragging = true;

      // 50ms 후 플래그 해제 (클릭 이벤트가 처리된 후)
      setTimeout(() => {
        justFinishedDragging = false;
      }, 50);
    }

    // 마우스 다운 상태 해제
    isMouseDown = false;

    // 드래그 선택 모드 종료 (선택된 셀은 유지)
    isSelectingCells = false;
  };

  // Reset table cell background color
  const resetTableCellBackgroundColor = () => {
    const cellsToReset = selectedTableCells.length > 0 ? selectedTableCells : (selectedTableCell ? [selectedTableCell] : []);
    cellsToReset.forEach(cell => {
      cell.style.removeProperty('background-color');
    });
    isTableContextMenuOpen = false;
    isTableCellColorOpen = false;
    clearCellSelection();
    handleInput();
  };

  // Set table cell background color
  const setTableCellBackgroundColor = (color: string) => {
    const cellsToColor = selectedTableCells.length > 0 ? selectedTableCells : (selectedTableCell ? [selectedTableCell] : []);
    cellsToColor.forEach(cell => {
      cell.style.backgroundColor = color;
    });
    isTableContextMenuOpen = false;
    isTableCellColorOpen = false;
    clearCellSelection();
    handleInput();
  };

  // Change table cell alignment
  const changeTableCellAlign = (align: 'left' | 'center' | 'right') => {
    const cellsToAlign = selectedTableCells.length > 0 ? selectedTableCells : (selectedTableCell ? [selectedTableCell] : []);
    cellsToAlign.forEach(cell => {
      cell.style.textAlign = align;
    });
    isTableContextMenuOpen = false;
    clearCellSelection();
    handleInput();
  };

  // Add table row
  const addTableRow = (position: 'above' | 'below') => {
    if (!selectedTableCell) return;

    const row = selectedTableCell.closest('tr');
    if (!row) return;

    const newRow = document.createElement('tr');
    const colCount = row.children.length;

    for (let i = 0; i < colCount; i++) {
      const td = document.createElement('td');
      td.style.border = '1px solid #ddd';
      td.style.padding = '8px';
      td.style.minWidth = '50px';
      td.innerHTML = '<br>';
      newRow.appendChild(td);
    }

    if (position === 'above') {
      row.before(newRow);
    } else {
      row.after(newRow);
    }

    isTableContextMenuOpen = false;
    clearCellSelection();
    handleInput();
  };

  // Delete table row
  const deleteTableRow = () => {
    if (!selectedTableCell) return;

    const row = selectedTableCell.closest('tr');
    if (!row) return;

    const tbody = row.parentNode as HTMLTableSectionElement;
    if (!tbody) return;

    // 마지막 행이면 삭제 불가
    if (tbody.rows.length <= 1) {
      alert('표에는 최소 1개의 행이 필요합니다.');
      return;
    }

    row.remove();
    isTableContextMenuOpen = false;
    selectedTableCell = null;
    clearCellSelection();
    handleInput();
  };

  // Add table column
  const addTableColumn = (position: 'left' | 'right') => {
    if (!selectedTableCell) return;

    const table = selectedTableCell.closest('table');
    if (!table) return;

    const row = selectedTableCell.closest('tr');
    if (!row) return;

    const cellIndex = Array.from(row.children).indexOf(selectedTableCell);
    const rows = table.querySelectorAll('tr');

    rows.forEach(tr => {
      const td = document.createElement('td');
      td.style.border = '1px solid #ddd';
      td.style.padding = '8px';
      td.style.minWidth = '50px';
      td.innerHTML = '<br>';

      const targetCell = tr.children[cellIndex];
      if (position === 'left') {
        targetCell?.before(td);
      } else {
        targetCell?.after(td);
      }
    });

    isTableContextMenuOpen = false;
    clearCellSelection();
    handleInput();
  };

  // Delete table column
  const deleteTableColumn = () => {
    if (!selectedTableCell) return;

    const cellIndex = selectedTableCell.cellIndex;
    const row = selectedTableCell.closest('tr');
    if (!row) return;

    const table = row.closest('table');
    if (!table) return;

    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    // 마지막 열이면 삭제 불가
    if (row.cells.length <= 1) {
      alert('표에는 최소 1개의 열이 필요합니다.');
      return;
    }

    Array.from(tbody.rows).forEach(tr => {
      if (tr.cells[cellIndex]) {
        tr.cells[cellIndex].remove();
      }
    });

    isTableContextMenuOpen = false;
    selectedTableCell = null;
    clearCellSelection();
    handleInput();
  };

  // Code view toggle
  const toggleCodeView = () => {
    if (!isCodeView) {
      // Switch to code view
      if (!editorRef) return;
      savedEditorHeight = editorRef.scrollHeight;
      originalHtml = editorRef.innerHTML;

      // Format HTML
      const formatted = originalHtml
        .replace(/></g, '>\n<')
        .replace(/(<\/?(?:p|div|h[1-6]|ul|ol|li|table|tr|td|th|tbody|thead|blockquote|pre|hr)[^>]*>)/gi, '\n$1\n')
        .split('\n')
        .filter(line => line.trim())
        .join('\n');

      codeContent = formatted;
      isCodeView = true;
    } else {
      // Switch back to WYSIWYG
      const contentToApply = codeContent.replace(/\n/g, '');
      isCodeView = false;
      savedEditorHeight = null;

      // Wait for next tick when editorRef is bound
      setTimeout(() => {
        if (editorRef) {
          editorRef.innerHTML = contentToApply;
          handleInput();
        }
      }, 0);
    }
  };

  // 이미지 선택
  const selectImage = (img: HTMLImageElement) => {
    // 기존 선택 해제
    if (selectedImage) {
      deselectImage();
    }

    selectedImage = img;

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
    if (img.style.width) {
      editImageWidth = img.style.width;
    } else {
      editImageWidth = 'original';
    }

    // 이미지의 정렬 상태 확인
    let container = img.parentElement;
    let currentImageAlign = 'left';

    while (container && container !== editorRef) {
      if (container.tagName === 'DIV' && container.style.textAlign) {
        currentImageAlign = container.style.textAlign;
        break;
      }
      container = container.parentElement;
    }

    editImageAlign = currentImageAlign;
    editImageAlt = img.alt || '';

    // 약간의 지연 후 편집창 열기
    setTimeout(() => {
      isImageEditPopupOpen = true;
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
          parent.insertBefore(selectedImage, wrapper);
          wrapper.remove();
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
    selectedImage = null;
    isImageEditPopupOpen = false;
    isResizing = false;
    resizeStartData = null;
  };

  // 리사이즈 시작
  const startResize = (e: MouseEvent, element: HTMLImageElement | HTMLElement, handle: string) => {
    isResizing = true;
    resizeStartData = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: element.offsetWidth,
      startHeight: element.offsetHeight,
      handle
    };
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

    // 정렬 적용
    let alignContainer = selectedImage.parentElement;

    if (alignContainer?.classList.contains('image-wrapper')) {
      alignContainer = alignContainer.parentElement;
    }

    if (alignContainer && alignContainer.tagName === 'DIV' && alignContainer !== editorRef) {
      alignContainer.style.textAlign = editImageAlign;
    } else {
      const newContainer = document.createElement('div');
      newContainer.style.textAlign = editImageAlign;

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

    const imageToDelete = selectedImage;
    deselectImage();

    let elementToRemove: HTMLElement = imageToDelete;
    let parent = imageToDelete.parentElement;

    while (parent && parent !== editorRef) {
      if (parent.classList.contains('image-wrapper') ||
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

  // 유튜브 선택
  const selectYoutube = (youtubeContainer: HTMLElement) => {
    if (selectedYoutube) {
      deselectYoutube();
    }
    if (selectedImage) {
      deselectImage();
    }

    selectedYoutube = youtubeContainer;

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

      handleDiv.onmousedown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        startResize(e, youtubeContainer, handle);
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
        editYoutubeWidth = 'original';
      } else if (youtubeContainer.style.width.includes('%')) {
        editYoutubeWidth = youtubeContainer.style.width;
      } else {
        // px 값을 %로 변환
        const parentWidth = editorRef?.offsetWidth || window.innerWidth;
        const containerWidth = parseInt(youtubeContainer.style.width);
        const percentage = Math.round((containerWidth / parentWidth) * 100);
        if (percentage >= 95) {
          editYoutubeWidth = '100%';
        } else if (percentage >= 70 && percentage <= 80) {
          editYoutubeWidth = '75%';
        } else if (percentage >= 45 && percentage <= 55) {
          editYoutubeWidth = '50%';
        } else {
          editYoutubeWidth = `${percentage}%`;
        }
      }
    } else {
      editYoutubeWidth = '100%';
    }

    // 정렬 상태 확인
    let container = youtubeContainer.parentElement;
    let currentYoutubeAlign = 'center';
    while (container && container !== editorRef) {
      if (container.tagName === 'DIV' && container.style.textAlign) {
        currentYoutubeAlign = container.style.textAlign;
        break;
      }
      container = container.parentElement;
    }
    editYoutubeAlign = currentYoutubeAlign;

    setTimeout(() => {
      isYoutubeEditPopupOpen = true;
    }, 50);
  };

  // 유튜브 선택 해제
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
        } catch (e) {
          // 이미 제거된 경우 무시
        }
      }
    }

    // 상태 초기화
    selectedYoutube = null;
    isYoutubeEditPopupOpen = false;
  };

  // 유튜브 편집 적용
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

    // 정렬 적용
    // youtube-wrapper의 부모를 찾음
    const targetElement = selectedYoutube.parentElement?.classList.contains('youtube-wrapper')
      ? selectedYoutube.parentElement
      : selectedYoutube;

    // 정렬 컨테이너 찾기 (최상위 DIV 컨테이너)
    const alignContainer = targetElement?.parentElement;

    // 정렬 컨테이너가 있고 DIV이면 정렬 적용
    if (alignContainer && alignContainer.tagName === 'DIV' && alignContainer !== editorRef) {
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

  // 유튜브 삭제
  const deleteYoutube = () => {
    if (!selectedYoutube) return;

    const youtubeToDelete = selectedYoutube;
    deselectYoutube();

    let elementToRemove: HTMLElement = youtubeToDelete;
    let parent = youtubeToDelete.parentElement;

    while (parent && parent !== editorRef) {
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

  // Keydown handler
  const handleKeyDown = (e: KeyboardEvent) => {
    // Backspace 또는 Delete 키로 선택된 이미지 삭제
    if ((e.key === 'Backspace' || e.key === 'Delete') && selectedImage) {
      e.preventDefault();
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
    if (editorRef && (!editorRef.innerHTML || editorRef.innerHTML === '<br>')) {
      // Enter, Backspace, Delete가 아닌 일반 문자 입력인 경우
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();

        // p 태그 생성 및 텍스트 삽입
        const p = document.createElement('p');
        p.textContent = e.key;
        editorRef.innerHTML = '';
        editorRef.appendChild(p);

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

    // Undo: Ctrl/Cmd + Z
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      performUndo();
      return;
    }

    // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      performRedo();
      return;
    }

    // Bold: Ctrl/Cmd + B
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      formatBold();
      return;
    }

    // Italic: Ctrl/Cmd + I
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      formatItalic();
      return;
    }

    // Underline: Ctrl/Cmd + U
    if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
      e.preventDefault();
      formatUnderline();
      return;
    }

    // Enter 키: 새 문단 (p 태그) 생성
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      // insertParagraph를 사용하여 새 문단 생성
      document.execCommand('insertParagraph', false);

      // 새로 생성된 문단을 p 태그로 변환
      setTimeout(() => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          let container: Node | null = range.commonAncestorContainer;

          // 텍스트 노드인 경우 부모 요소로
          if (container.nodeType === Node.TEXT_NODE) {
            container = container.parentElement;
          }

          // div인 경우 p로 변경
          if (container && (container as HTMLElement).tagName === 'DIV') {
            document.execCommand('formatBlock', false, 'p');
          }
        }
        handleInput();
      }, 0);
      return;
    }
    // Shift+Enter는 브라우저 기본 동작 사용 (br 태그 삽입)
  };

  // Click outside to close dropdowns
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;

    if (!target.closest(`.${styles.paragraphDropdown}`) && !target.closest(`.${styles.paragraphButton}`)) {
      isParagraphDropdownOpen = false;
    }
    if (!target.closest(`.${styles.colorDropdown}`) && !target.closest(`.${styles.colorButton}`)) {
      isTextColorOpen = false;
      isBgColorOpen = false;
    }
    if (!target.closest(`.${styles.alignDropdown}`) && !target.closest(`.${styles.alignButton}`)) {
      isAlignDropdownOpen = false;
    }
    if (!target.closest(`.${styles.linkDropdown}`) && !target.closest(`.${styles.linkButton}`)) {
      isLinkDropdownOpen = false;
    }
    if (!target.closest(`.${styles.tableDropdown}`) && !target.closest(`.${styles.tableButton}`)) {
      isTableDropdownOpen = false;
    }
    if (!target.closest(`.${styles.imageDropdown}`) && !target.closest(`.${styles.imageButton}`) && !target.closest(`.${styles.youtubeButton}`)) {
      isImageDropdownOpen = false;
      isYoutubeDropdownOpen = false;
    }
    // 링크 수정 팝업 닫기
    if (isEditLinkPopupOpen) {
      const editPopup = document.querySelector(`.${styles.editLinkPopup}`);
      if (editPopup && !editPopup.contains(target) && !selectedLinkElement?.contains(target)) {
        isEditLinkPopupOpen = false;
        selectedLinkElement = null;
      }
    }
    // 테이블 컨텍스트 메뉴 닫기
    if (isTableContextMenuOpen && tableContextMenuRef && !tableContextMenuRef.contains(target)) {
      isTableContextMenuOpen = false;
      selectedTableCell = null;
      isTableCellColorOpen = false;
    }
    // 이미지 편집 팝업 닫기
    if (isImageEditPopupOpen && selectedImage) {
      const editPopup = document.querySelector(`.${styles.imageDropdown}`);
      if (editPopup && !editPopup.contains(target) && !target.closest('.image-wrapper')) {
        deselectImage();
      }
    }
    // 유튜브 편집 팝업 닫기
    if (isYoutubeEditPopupOpen && selectedYoutube) {
      const editPopup = document.querySelector(`.${styles.imageDropdown}`);
      if (editPopup && !editPopup.contains(target) && !target.closest('.youtube-wrapper')) {
        deselectYoutube();
      }
    }
  };

  // Handle editor click to detect link/image/youtube clicks
  const handleEditorClick = (e: MouseEvent) => {
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
    if ((target.classList.contains('youtube-overlay') || target.closest('.youtube-container')) && editorRef?.contains(target)) {
      e.preventDefault();
      e.stopPropagation();

      const youtubeContainer = target.closest('.youtube-container') as HTMLElement;
      if (youtubeContainer) {
        if (selectedYoutube !== youtubeContainer) {
          if (selectedYoutube) {
            deselectYoutube();
          }
          if (selectedImage) {
            deselectImage();
          }
          selectYoutube(youtubeContainer);
        } else {
          isYoutubeEditPopupOpen = !isYoutubeEditPopupOpen;
        }
      }
      return;
    }

    // 이미지 요소인지 확인
    if (target.tagName === 'IMG' && editorRef?.contains(target)) {
      e.preventDefault();
      e.stopPropagation();
      const img = target as HTMLImageElement;

      if (selectedImage !== img) {
        if (selectedImage) {
          deselectImage();
        }
        if (selectedYoutube) {
          deselectYoutube();
        }
        selectImage(img);
      } else {
        isImageEditPopupOpen = !isImageEditPopupOpen;
      }
      return;
    }

    // 기존 선택된 이미지가 있으면 선택 해제
    if (selectedImage && !target.closest('.image-wrapper') && !isResizing) {
      deselectImage();
    }

    // 기존 선택된 유튜브가 있으면 선택 해제
    if (selectedYoutube && !target.closest('.youtube-wrapper') && !isResizing) {
      deselectYoutube();
    }

    // 표 컨텍스트 메뉴 닫기
    if (isTableContextMenuOpen && !target.closest(`.${styles.tableContextMenu}`)) {
      isTableContextMenuOpen = false;
      selectedTableCell = null;
      isTableCellColorOpen = false;
    }

    // 표 셀 클릭 시에는 선택 유지
    const clickedCell = target.closest('td');

    // 드래그가 방금 끝난 경우 선택 해제하지 않음
    if (justFinishedDragging) {
      return;
    }

    // 표 셀 외부를 클릭한 경우에만 선택 해제
    if (!clickedCell && selectedTableCells.length > 0) {
      clearCellSelection();
    }

    // 링크 요소인지 확인
    const linkElement = target.closest('a') as HTMLAnchorElement;
    if (linkElement && editorRef?.contains(linkElement)) {
      e.preventDefault();
      selectedLinkElement = linkElement;
      editLinkUrl = linkElement.href;
      editLinkTarget = linkElement.target || '_self';
      isEditLinkPopupOpen = true;
    } else {
      // 기존 상태 감지
      detectCurrentParagraphStyle();
      detectCurrentAlign();
      detectTextStyles();
    }
  };

  // Initialize value
  $effect(() => {
    if (editorRef && value !== editorRef.innerHTML && !isUndoRedo) {
      editorRef.innerHTML = value;
    }
  });

  // 표 셀 드래그 선택 이벤트 등록
  $effect(() => {
    if (!editorRef || isCodeView) return;

    editorRef.addEventListener('mousedown', handleCellMouseDown as EventListener);
    document.addEventListener('mousemove', handleCellMouseMove as EventListener);
    document.addEventListener('mouseup', handleCellMouseUp as EventListener);

    return () => {
      editorRef.removeEventListener('mousedown', handleCellMouseDown as EventListener);
      document.removeEventListener('mousemove', handleCellMouseMove as EventListener);
      document.removeEventListener('mouseup', handleCellMouseUp as EventListener);
    };
  });

  // DOM Mutation Observer - 선택된 유튜브가 DOM에서 제거되는 것을 감지
  $effect(() => {
    if (!selectedYoutube || !editorRef) return;

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
    observer.observe(editorRef, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
    };
  });

  onMount(() => {
    if (editorRef && value) {
      editorRef.innerHTML = value;
    }

    if (typeof document !== 'undefined') {
      document.addEventListener('mousedown', handleClickOutside);
    }
  });

  onDestroy(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    if (historyTimer) {
      clearTimeout(historyTimer);
    }
  });

  // 리사이즈 중 마우스 이벤트 처리
  $effect(() => {
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
            const diagonalDelta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
            const multiplier = resizeStartData.handle.includes('e') ? 1 : -1;
            newWidth = resizeStartData.startWidth + (diagonalDelta * multiplier);
            newHeight = newWidth / aspectRatio;
            break;
          }
        }

        // 최소/최대 크기 제한
        const parentWidth = editorRef?.offsetWidth || window.innerWidth;
        newWidth = Math.max(200, Math.min(newWidth, parentWidth - 40));
        newHeight = newWidth / aspectRatio;

        // 유튜브 컨테이너 크기 업데이트
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
          editYoutubeWidth = '100%';
        } else if (percentage >= 70 && percentage <= 80) {
          editYoutubeWidth = '75%';
        } else if (percentage >= 45 && percentage <= 55) {
          editYoutubeWidth = '50%';
        } else {
          editYoutubeWidth = `${percentage}%`;
        }
      }
    };

    const handleMouseUp = () => {
      isResizing = false;
      resizeStartData = null;
      if (selectedImage) {
        editImageWidth = selectedImage.style.width;
      }
      if (selectedYoutube) {
        const currentWidth = selectedYoutube.style.width;
        editYoutubeWidth = currentWidth;
        selectedYoutube.dataset.originalWidth = currentWidth;
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  });

  // Computed styles
  const editorStyle = $derived.by(() => {
    const styles: Record<string, string> = { width };

    if (height === 'contents') {
      styles.height = 'auto';
    } else {
      styles.height = height;
    }

    if (minHeight) styles.minHeight = minHeight;
    if (maxHeight) styles.maxHeight = maxHeight;

    return Object.entries(styles).map(([k, v]) => `${k}: ${v}`).join('; ');
  });
</script>

<div
  bind:this={containerRef}
  class="{styles.editor} {className}"
  style="width: {width};"
  {...rest}
>
  <!-- Toolbar -->
  <div class={styles.toolbar}>
    <!-- Undo/Redo -->
    {#if isToolbarItemEnabled('undo-redo')}
      <div class={styles.toolbarGroup}>
        <button
          type="button"
          class={styles.toolbarButton}
          onmousedown={(e) => e.preventDefault()}
          onclick={performUndo}
          disabled={historyIndex <= 0}
          title="실행 취소"
          style="opacity: {historyIndex <= 0 ? 0.65 : 1}; background-color: transparent; border: none; cursor: {historyIndex <= 0 ? 'not-allowed' : 'pointer'};"
        >
          <i class={styles.undo}></i>
        </button>
        <button
          type="button"
          class={styles.toolbarButton}
          onmousedown={(e) => e.preventDefault()}
          onclick={performRedo}
          disabled={historyIndex >= history.length - 1}
          title="다시 실행"
          style="opacity: {historyIndex >= history.length - 1 ? 0.65 : 1}; background-color: transparent; border: none; cursor: {historyIndex >= history.length - 1 ? 'not-allowed' : 'pointer'};"
        >
          <i class={styles.redo}></i>
        </button>
      </div>
    {/if}

    <!-- Paragraph format -->
    {#if isToolbarItemEnabled('paragraph')}
      <div class={styles.toolbarGroup}>
        <div bind:this={paragraphButtonRef} style="position: relative;">
          <button
            type="button"
            class={styles.paragraphButton}
            onmousedown={(e) => e.preventDefault()}
            onclick={() => {
              if (paragraphButtonRef) {
                const rect = paragraphButtonRef.getBoundingClientRect();
                paragraphDropdownPos = { top: rect.bottom, left: rect.left };
              }
              isParagraphDropdownOpen = !isParagraphDropdownOpen;
              isTextColorOpen = false;
              isBgColorOpen = false;
              isAlignDropdownOpen = false;
            }}
          >
            <span>{getCurrentStyleLabel()}</span>
            <i class={styles.dropdownArrow}></i>
          </button>
          {#if isParagraphDropdownOpen}
            <div
              class={styles.paragraphDropdown}
              style="top: {paragraphDropdownPos.top}px; left: {paragraphDropdownPos.left}px;"
            >
              {#each paragraphOptions as option}
                <button
                  type="button"
                  class="{styles.paragraphOption} {currentParagraphStyle === option.value ? styles.active : ''}"
                  onmousedown={(e) => e.preventDefault()}
                  onclick={() => setParagraphFormat(option.value)}
                >
                  {#if option.value === 'h1'}
                    <h1>{option.label}</h1>
                  {:else if option.value === 'h2'}
                    <h2>{option.label}</h2>
                  {:else if option.value === 'h3'}
                    <h3>{option.label}</h3>
                  {:else}
                    <span class={option.className || ''}>{option.label}</span>
                  {/if}
                </button>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <!-- Text style -->
    {#if isToolbarItemEnabled('text-style')}
      <div class={styles.toolbarGroup}>
        <button type="button" class="{styles.toolbarButton} {isBold ? styles.active : ''}" onmousedown={(e) => e.preventDefault()} onclick={formatBold} title="굵게 (Ctrl+B)">
          <i class={styles.bold}></i>
        </button>
        <button type="button" class="{styles.toolbarButton} {isItalic ? styles.active : ''}" onmousedown={(e) => e.preventDefault()} onclick={formatItalic} title="기울임 (Ctrl+I)">
          <i class={styles.italic}></i>
        </button>
        <button type="button" class="{styles.toolbarButton} {isUnderline ? styles.active : ''}" onmousedown={(e) => e.preventDefault()} onclick={formatUnderline} title="밑줄 (Ctrl+U)">
          <i class={styles.underline}></i>
        </button>
        <button type="button" class="{styles.toolbarButton} {isStrikethrough ? styles.active : ''}" onmousedown={(e) => e.preventDefault()} onclick={formatStrikethrough} title="취소선">
          <i class={styles.strikethrough}></i>
        </button>
      </div>
    {/if}

    <!-- Color -->
    {#if isToolbarItemEnabled('color')}
      <div class={styles.toolbarGroup}>
        <div bind:this={textColorButtonRef} style="position: relative;">
          <button
            type="button"
            class={styles.toolbarButton}
            onmousedown={(e) => e.preventDefault()}
            onclick={() => {
              const selection = window.getSelection();
              if (selection && !selection.isCollapsed) {
                savedSelection = selection.getRangeAt(0).cloneRange();
                if (textColorButtonRef) {
                  const rect = textColorButtonRef.getBoundingClientRect();
                  textColorDropdownPos = { top: rect.bottom, left: rect.left };
                }
                isTextColorOpen = !isTextColorOpen;
                isBgColorOpen = false;
              }
            }}
            title="글꼴 색상"
          >
            <i class={styles.fontColor}></i>
          </button>
          {#if isTextColorOpen}
            <div
              class={styles.colorPalette}
              style="top: {textColorDropdownPos.top}px; left: {textColorDropdownPos.left}px;"
            >
              {#each colorPalette as row}
                <div class={styles.colorRow}>
                  {#each row as color}
                    <button
                      type="button"
                      class={styles.colorButton}
                      style="background-color: {color};"
                      onmousedown={(e) => e.preventDefault()}
                      onclick={() => {
                        setTextColor(color);
                        isTextColorOpen = false;
                      }}
                    ></button>
                  {/each}
                </div>
              {/each}
            </div>
          {/if}
        </div>
        <div bind:this={bgColorButtonRef} style="position: relative;">
          <button
            type="button"
            class={styles.toolbarButton}
            onmousedown={(e) => e.preventDefault()}
            onclick={() => {
              const selection = window.getSelection();
              if (selection && !selection.isCollapsed) {
                savedSelection = selection.getRangeAt(0).cloneRange();
                if (bgColorButtonRef) {
                  const rect = bgColorButtonRef.getBoundingClientRect();
                  bgColorDropdownPos = { top: rect.bottom, left: rect.left };
                }
                isBgColorOpen = !isBgColorOpen;
                isTextColorOpen = false;
              }
            }}
            title="배경 색상"
          >
            <i class={styles.highlight}></i>
          </button>
          {#if isBgColorOpen}
            <div
              class={styles.colorPalette}
              style="top: {bgColorDropdownPos.top}px; left: {bgColorDropdownPos.left}px;"
            >
              {#each colorPalette as row}
                <div class={styles.colorRow}>
                  {#each row as color}
                    <button
                      type="button"
                      class={styles.colorButton}
                      style="background-color: {color};"
                      onmousedown={(e) => e.preventDefault()}
                      onclick={() => {
                        setBackgroundColor(color);
                        isBgColorOpen = false;
                      }}
                    ></button>
                  {/each}
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <!-- Align + List + Table (combined group like React) -->
    {#if isToolbarItemEnabled('align') || isToolbarItemEnabled('list') || isToolbarItemEnabled('table')}
      <div class={styles.toolbarGroup}>
        {#if isToolbarItemEnabled('align')}
        <div bind:this={alignButtonRef} style="position: relative;">
          <button
            type="button"
            class={styles.toolbarButton}
            onmousedown={(e) => e.preventDefault()}
            onclick={() => {
              if (alignButtonRef) {
                const rect = alignButtonRef.getBoundingClientRect();
                alignDropdownPos = { top: rect.bottom, left: rect.left };
              }
              isAlignDropdownOpen = !isAlignDropdownOpen;
              isParagraphDropdownOpen = false;
              isTextColorOpen = false;
              isBgColorOpen = false;
            }}
            title={getCurrentAlignLabel()}
          >
            <i class={getCurrentAlignIcon()}></i>
          </button>
          {#if isAlignDropdownOpen}
            <div
              class={styles.alignDropdown}
              style="top: {alignDropdownPos.top}px; left: {alignDropdownPos.left}px;"
            >
              {#each alignOptions as option}
                <button
                  type="button"
                  class="{styles.alignOption} {currentAlign === option.value ? styles.active : ''}"
                  onmousedown={(e) => e.preventDefault()}
                  onclick={() => setAlignment(option.value)}
                  title={option.label}
                >
                  <i class={styles[option.icon]}></i>
                </button>
              {/each}
            </div>
          {/if}
        </div>
        {/if}

        {#if isToolbarItemEnabled('list')}
        <button type="button" class={styles.toolbarButton} onmousedown={(e) => e.preventDefault()} onclick={() => insertList(false)} title="목록">
          <i class={styles.listUl}></i>
        </button>
        <button type="button" class={styles.toolbarButton} onmousedown={(e) => e.preventDefault()} onclick={() => insertList(true)} title="번호 목록">
          <i class={styles.listOl}></i>
        </button>
        {/if}

        {#if isToolbarItemEnabled('table')}
        <div bind:this={tableButtonRef} class={styles.tableButton} style="position: relative;">
          <button
            type="button"
            class={styles.toolbarButton}
            onmousedown={(e) => e.preventDefault()}
            onclick={() => {
              const selection = window.getSelection();
              if (selection && selection.rangeCount > 0) {
                savedTableSelection = selection.getRangeAt(0).cloneRange();
              }
              if (tableButtonRef) {
                const rect = tableButtonRef.getBoundingClientRect();
                tableDropdownPos = { top: rect.bottom, left: rect.left };
              }
              isTableDropdownOpen = !isTableDropdownOpen;
            }}
            title="표 삽입"
          >
            <i class={styles.table}></i>
          </button>
          {#if isTableDropdownOpen}
            <div class={styles.tableDropdown} style="top: {tableDropdownPos.top}px; left: {tableDropdownPos.left}px;">
              <div class={styles.tableGridSelector}>
                <div class={styles.tableGridLabel}>
                  {tableRows > 0 && tableCols > 0 ? `${tableRows} × ${tableCols} 표` : '표 크기 선택'}
                </div>
                <div class={styles.tableGrid}>
                  {#each Array(10) as _, row}
                    <div class={styles.tableGridRow}>
                      {#each Array(10) as _, col}
                        <div
                          class="{styles.tableGridCell} {row < tableRows && col < tableCols ? styles.active : ''}"
                          role="button"
                          tabindex="0"
                          onmouseenter={() => { tableRows = row + 1; tableCols = col + 1; }}
                          onclick={() => insertTable(row + 1, col + 1)}
                        ></div>
                      {/each}
                    </div>
                  {/each}
                </div>
              </div>
            </div>
          {/if}
        </div>
        {/if}
      </div>
    {/if}

    <!-- Link + Image + YouTube (combined group like React) -->
    {#if isToolbarItemEnabled('link') || isToolbarItemEnabled('image') || isToolbarItemEnabled('youtube')}
      <div class={styles.toolbarGroup}>
        {#if isToolbarItemEnabled('link')}
        <div bind:this={linkButtonRef} class={styles.linkButton} style="position: relative;">
          <button
            type="button"
            class={styles.toolbarButton}
            onmousedown={(e) => e.preventDefault()}
            onclick={() => {
              const selection = window.getSelection();
              if (selection && selection.rangeCount > 0) {
                savedSelection = selection.getRangeAt(0).cloneRange();
              }
              if (linkButtonRef) {
                const rect = linkButtonRef.getBoundingClientRect();
                linkDropdownPos = { top: rect.bottom, left: rect.left };
              }
              isLinkDropdownOpen = !isLinkDropdownOpen;
            }}
            title="링크 삽입"
          >
            <i class={styles.link}></i>
          </button>
          {#if isLinkDropdownOpen}
            <div class={styles.linkDropdown} style="top: {linkDropdownPos.top}px; left: {linkDropdownPos.left}px;">
              <div class={styles.linkInput}>
                <label>URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  bind:value={linkUrl}
                  onkeydown={(e) => e.key === 'Enter' && insertLink()}
                />
              </div>
              <div class={styles.linkTarget}>
                <label>
                  <input type="radio" bind:group={linkTarget} value="_blank" /> 새 창에서 열기
                </label>
                <label>
                  <input type="radio" bind:group={linkTarget} value="_self" /> 현재 창에서 열기
                </label>
              </div>
              <div class={styles.linkActions}>
                <button
                  type="button"
                  onclick={() => {
                    isLinkDropdownOpen = false;
                    linkUrl = '';
                    linkTarget = '_blank';
                  }}
                  class={styles.default}
                >
                  취소
                </button>
                <button type="button" class={styles.primary} onclick={insertLink} disabled={!linkUrl}>
                  삽입
                </button>
              </div>
            </div>
          {/if}
        </div>
        {/if}

        {#if isToolbarItemEnabled('image')}
        <div class={styles.imageButton} bind:this={imageButtonRef} style="position: relative;">
          <button
            type="button"
            class={styles.toolbarButton}
            onmousedown={(e) => e.preventDefault()}
            onclick={() => {
              const selection = window.getSelection();
              if (selection && selection.rangeCount > 0) {
                savedImageSelection = selection.getRangeAt(0).cloneRange();
              }
              if (imageButtonRef) {
                const rect = imageButtonRef.getBoundingClientRect();
                imageDropdownPos = { top: rect.bottom, left: rect.left };
              }
              isImageDropdownOpen = !isImageDropdownOpen;
              isYoutubeDropdownOpen = false;
            }}
            title="이미지"
          >
            <i class={styles.image}></i>
          </button>
          {#if isImageDropdownOpen}
            <div class={styles.imageDropdown} style="top: {imageDropdownPos.top}px; left: {imageDropdownPos.left}px;">
              <div class={styles.imageTabSection}>
                <div class={styles.imageTabButtons}>
                  <button
                    type="button"
                    class={imageTabMode === 'file' ? styles.active : ''}
                    onclick={() => {
                      imageTabMode = 'file';
                      imageUrl = '';
                    }}
                  >
                    파일 업로드
                  </button>
                  <button
                    type="button"
                    class={imageTabMode === 'url' ? styles.active : ''}
                    onclick={() => {
                      imageTabMode = 'url';
                      imageFile = null;
                      imagePreview = '';
                    }}
                  >
                    URL 입력
                  </button>
                </div>

                <!-- 파일 업로드 탭 -->
                {#if imageTabMode === 'file'}
                  <div class={styles.imageFileSection}>
                    <input
                      bind:this={imageFileInputRef}
                      type="file"
                      accept="image/*"
                      onchange={handleImageFileSelect}
                      style="display: none;"
                    />
                    <button
                      type="button"
                      onclick={() => imageFileInputRef?.click()}
                      class={styles.fileSelectButton}
                    >
                      {imageFile ? imageFile.name : '파일 선택'}
                    </button>
                    {#if imagePreview}
                      <div class={styles.imagePreviewBox}>
                        <img src={imagePreview} alt="Preview" />
                      </div>
                    {/if}
                  </div>
                {/if}

                <!-- URL 입력 탭 -->
                {#if imageTabMode === 'url'}
                  <div class={styles.imageUrlSection}>
                    <input
                      type="text"
                      bind:value={imageUrl}
                      placeholder="https://..."
                    />
                  </div>
                {/if}
              </div>

              <div class={styles.imageOptions}>
                <div class={styles.imageOptionRow}>
                  <label>크기</label>
                  <div class={styles.imageSizeButtons}>
                    <button
                      type="button"
                      class={imageWidth === '100%' ? styles.active : ''}
                      onclick={() => imageWidth = '100%'}
                    >
                      100%
                    </button>
                    <button
                      type="button"
                      class={imageWidth === '75%' ? styles.active : ''}
                      onclick={() => imageWidth = '75%'}
                    >
                      75%
                    </button>
                    <button
                      type="button"
                      class={imageWidth === '50%' ? styles.active : ''}
                      onclick={() => imageWidth = '50%'}
                    >
                      50%
                    </button>
                    <button
                      type="button"
                      class={imageWidth === 'original' ? styles.active : ''}
                      onclick={() => imageWidth = 'original'}
                    >
                      원본
                    </button>
                  </div>
                </div>

                <div class={styles.imageOptionRow}>
                  <label>정렬</label>
                  <div class={styles.imageAlignButtons}>
                    <button
                      type="button"
                      class={imageAlign === 'left' ? styles.active : ''}
                      onclick={() => imageAlign = 'left'}
                      title="왼쪽 정렬"
                    >
                      <i class={styles.alignLeft}></i>
                    </button>
                    <button
                      type="button"
                      class={imageAlign === 'center' ? styles.active : ''}
                      onclick={() => imageAlign = 'center'}
                      title="가운데 정렬"
                    >
                      <i class={styles.alignCenter}></i>
                    </button>
                    <button
                      type="button"
                      class={imageAlign === 'right' ? styles.active : ''}
                      onclick={() => imageAlign = 'right'}
                      title="오른쪽 정렬"
                    >
                      <i class={styles.alignRight}></i>
                    </button>
                  </div>
                </div>

                <div class={styles.imageOptionRow}>
                  <label>대체 텍스트</label>
                  <input
                    type="text"
                    bind:value={imageAlt}
                    placeholder="이미지 설명..."
                  />
                </div>
              </div>

              <div class={styles.imageActions}>
                <button
                  type="button"
                  onclick={() => {
                    isImageDropdownOpen = false;
                    imageTabMode = 'file';
                    imageUrl = '';
                    imageFile = null;
                    imagePreview = '';
                    imageWidth = 'original';
                    imageAlign = 'left';
                    imageAlt = '';
                    savedImageSelection = null;
                  }}
                  class={styles.default}
                >
                  취소
                </button>
                <button
                  type="button"
                  onclick={insertImage}
                  disabled={!imageUrl && !imageFile}
                  class={styles.primary}
                >
                  삽입
                </button>
              </div>
            </div>
          {/if}
        </div>
        {/if}

        {#if isToolbarItemEnabled('youtube')}
        <div class={styles.youtubeButton} bind:this={youtubeButtonRef} style="position: relative;">
          <button
            type="button"
            class={styles.toolbarButton}
            onmousedown={(e) => e.preventDefault()}
            onclick={() => {
              const selection = window.getSelection();
              if (selection && selection.rangeCount > 0) {
                savedYoutubeSelection = selection.getRangeAt(0).cloneRange();
              }
              if (youtubeButtonRef) {
                const rect = youtubeButtonRef.getBoundingClientRect();
                youtubeDropdownPos = { top: rect.bottom, left: rect.left };
              }
              isYoutubeDropdownOpen = !isYoutubeDropdownOpen;
              isImageDropdownOpen = false;
            }}
            title="유튜브"
          >
            <i class={styles.youtube}></i>
          </button>
          {#if isYoutubeDropdownOpen}
            <div class={styles.imageDropdown} style="top: {youtubeDropdownPos.top}px; left: {youtubeDropdownPos.left}px;">
              <div class={styles.imageTabSection}>
                <div class={styles.imageTabButtons}>
                  <button
                    type="button"
                    class={styles.active}
                    style="width: 100%"
                  >
                    유튜브 URL
                  </button>
                </div>

                <div class={styles.imageUrlSection}>
                  <input
                    type="text"
                    bind:value={youtubeUrl}
                    placeholder="https://www.youtube.com/watch?v=... 또는 https://youtu.be/..."
                  />
                </div>
              </div>

              <div class={styles.imageOptions}>
                <div class={styles.imageOptionRow}>
                  <label>크기</label>
                  <div class={styles.imageSizeButtons}>
                    <button
                      type="button"
                      class={youtubeWidth === '100%' ? styles.active : ''}
                      onclick={() => youtubeWidth = '100%'}
                    >
                      100%
                    </button>
                    <button
                      type="button"
                      class={youtubeWidth === '75%' ? styles.active : ''}
                      onclick={() => youtubeWidth = '75%'}
                    >
                      75%
                    </button>
                    <button
                      type="button"
                      class={youtubeWidth === '50%' ? styles.active : ''}
                      onclick={() => youtubeWidth = '50%'}
                    >
                      50%
                    </button>
                    <button
                      type="button"
                      class={youtubeWidth === 'original' ? styles.active : ''}
                      onclick={() => youtubeWidth = 'original'}
                    >
                      원본
                    </button>
                  </div>
                </div>

                <div class={styles.imageOptionRow}>
                  <label>정렬</label>
                  <div class={styles.imageAlignButtons}>
                    <button
                      type="button"
                      class={youtubeAlign === 'left' ? styles.active : ''}
                      onclick={() => youtubeAlign = 'left'}
                      title="왼쪽 정렬"
                    >
                      <i class={styles.alignLeft}></i>
                    </button>
                    <button
                      type="button"
                      class={youtubeAlign === 'center' ? styles.active : ''}
                      onclick={() => youtubeAlign = 'center'}
                      title="가운데 정렬"
                    >
                      <i class={styles.alignCenter}></i>
                    </button>
                    <button
                      type="button"
                      class={youtubeAlign === 'right' ? styles.active : ''}
                      onclick={() => youtubeAlign = 'right'}
                      title="오른쪽 정렬"
                    >
                      <i class={styles.alignRight}></i>
                    </button>
                  </div>
                </div>
              </div>

              <div class={styles.imageActions}>
                <button
                  type="button"
                  class={styles.default}
                  onclick={() => {
                    isYoutubeDropdownOpen = false;
                    youtubeUrl = '';
                    youtubeWidth = '100%';
                    youtubeAlign = 'center';
                    savedYoutubeSelection = null;
                  }}
                >
                  취소
                </button>
                <button
                  type="button"
                  class={styles.primary}
                  onclick={insertYoutube}
                  disabled={!youtubeUrl}
                >
                  삽입
                </button>
              </div>
            </div>
          {/if}
        </div>
        {/if}
      </div>
    {/if}

    <!-- HR -->
    {#if isToolbarItemEnabled('hr')}
      <div class={styles.toolbarGroup}>
        <button type="button" class={styles.toolbarButton} onmousedown={(e) => e.preventDefault()} onclick={insertHR} title="구분선">
          <i class={styles.hr}></i>
        </button>
      </div>
    {/if}

    <!-- Format clear -->
    {#if isToolbarItemEnabled('format')}
      <div class={styles.toolbarGroup}>
        <button type="button" class={styles.toolbarButton} onmousedown={(e) => e.preventDefault()} onclick={removeFormat} title="서식 지우기">
          <i class={styles.eraser}></i>
        </button>
      </div>
    {/if}

    <!-- Code view -->
    {#if isToolbarItemEnabled('code')}
      <div class={styles.toolbarGroup}>
        <button
          type="button"
          class="{styles.toolbarButton} {isCodeView ? styles.active : ''}"
          onmousedown={(e) => e.preventDefault()}
          onclick={toggleCodeView}
          title="코드 보기"
        >
          <i class={styles.code}></i>
        </button>
      </div>
    {/if}
  </div>

  <!-- Editor content -->
  <div class="{styles.editorContainer} {resizable ? styles.resizable : ''}" style="{editorStyle}; display: flex; flex-direction: column;">
    {#if !isCodeView}
      <div
        bind:this={editorRef}
        id={editorID}
        class={styles.editorContent}
        contenteditable="true"
        data-placeholder={placeholder}
        oninput={handleInput}
        oncompositionstart={handleCompositionStart}
        oncompositionend={handleCompositionEnd}
        onpaste={handlePaste}
        ondragover={handleDragOver}
        ondrop={handleDrop}
        onkeydown={handleKeyDown}
        onkeyup={() => {
          detectCurrentParagraphStyle();
          detectCurrentAlign();
          detectTextStyles();
        }}
        onclick={handleEditorClick}
        oncontextmenu={handleTableContextMenu}
        role="textbox"
        aria-multiline="true"
        style="flex: 1; overflow-y: auto;"
      ></div>
    {:else}
      <textarea
        bind:this={codeEditorRef}
        class={styles.codeEditor}
        bind:value={codeContent}
        style="height: {savedEditorHeight}px;"
      ></textarea>
    {/if}
  </div>

  <!-- 링크 수정 팝업 -->
  {#if isEditLinkPopupOpen && selectedLinkElement}
    <div
      class={styles.editLinkPopup}
      style="position: absolute; top: {selectedLinkElement.offsetTop + selectedLinkElement.offsetHeight + 5}px; left: {selectedLinkElement.offsetLeft}px;"
    >
      <div class={styles.editLinkContent}>
        <div class={styles.editLinkInput}>
          <label>URL 수정</label>
          <input
            type="text"
            bind:value={editLinkUrl}
            placeholder="https://..."
          />
        </div>
        <div class={styles.editLinkTarget}>
          <label>
            <input
              type="radio"
              value="_blank"
              checked={editLinkTarget === '_blank'}
              onchange={() => editLinkTarget = '_blank'}
            />
            새 창에서 열기
          </label>
          <label>
            <input
              type="radio"
              value="_self"
              checked={editLinkTarget === '_self'}
              onchange={() => editLinkTarget = '_self'}
            />
            현재 창에서 열기
          </label>
        </div>
        <div class={styles.editLinkActions}>
          <button
            type="button"
            onclick={removeLink}
            class={styles.danger}
          >
            링크 삭제
          </button>
          <div style="display: flex; gap: 8px;">
            <button
              type="button"
              onclick={() => {
                isEditLinkPopupOpen = false;
                selectedLinkElement = null;
                editLinkUrl = '';
                editLinkTarget = '_self';
              }}
              class={styles.default}
            >
              취소
            </button>
            <button
              type="button"
              onclick={updateLink}
              disabled={!editLinkUrl}
              class={styles.primary}
            >
              적용
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- 테이블 컨텍스트 메뉴 -->
  {#if isTableContextMenuOpen && selectedTableCell}
    <div
      bind:this={tableContextMenuRef}
      class={styles.tableContextMenu}
      style="position: fixed; top: {tableContextMenuPosition.y}px; left: {tableContextMenuPosition.x}px; z-index: 10000;"
    >
      {#if selectedTableCells.length > 1}
        <div class={styles.tableContextMenuHeader}>
          {selectedTableCells.length}개 셀 선택됨
        </div>
      {/if}

      <div class={styles.tableContextMenuItem}>
        <button
          type="button"
          onclick={() => isTableCellColorOpen = !isTableCellColorOpen}
          class={styles.tableContextMenuButton}
        >
          셀 배경색 {selectedTableCells.length > 1 ? `(${selectedTableCells.length}개)` : ''}
        </button>
        {#if isTableCellColorOpen}
          <div class={styles.tableCellColorPicker}>
            {#each colorPalette as row}
              <div class={styles.colorRow}>
                {#each row as color}
                  <button
                    type="button"
                    class={styles.colorCell}
                    style="background-color: {color};"
                    onclick={() => setTableCellBackgroundColor(color)}
                    title={color}
                  ></button>
                {/each}
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <button
        type="button"
        onclick={resetTableCellBackgroundColor}
        class={styles.tableContextMenuButton}
      >
        배경색 초기화
      </button>

      <div class={styles.tableContextMenuDivider}></div>

      <button
        type="button"
        onclick={() => changeTableCellAlign('left')}
        class={styles.tableContextMenuButton}
      >
        왼쪽 정렬
      </button>
      <button
        type="button"
        onclick={() => changeTableCellAlign('center')}
        class={styles.tableContextMenuButton}
      >
        가운데 정렬
      </button>
      <button
        type="button"
        onclick={() => changeTableCellAlign('right')}
        class={styles.tableContextMenuButton}
      >
        오른쪽 정렬
      </button>

      <div class={styles.tableContextMenuDivider}></div>

      <button
        type="button"
        onclick={() => addTableRow('above')}
        class={styles.tableContextMenuButton}
      >
        위에 행 추가
      </button>
      <button
        type="button"
        onclick={() => addTableRow('below')}
        class={styles.tableContextMenuButton}
      >
        아래에 행 추가
      </button>
      <button
        type="button"
        onclick={deleteTableRow}
        class={styles.tableContextMenuButton}
      >
        행 삭제
      </button>

      <div class={styles.tableContextMenuDivider}></div>

      <button
        type="button"
        onclick={() => addTableColumn('left')}
        class={styles.tableContextMenuButton}
      >
        왼쪽에 열 추가
      </button>
      <button
        type="button"
        onclick={() => addTableColumn('right')}
        class={styles.tableContextMenuButton}
      >
        오른쪽에 열 추가
      </button>
      <button
        type="button"
        onclick={deleteTableColumn}
        class={styles.tableContextMenuButton}
      >
        열 삭제
      </button>
    </div>
  {/if}

  <!-- 이미지 편집 팝업 -->
  {#if isImageEditPopupOpen && selectedImage}
    {@const imageWrapper = selectedImage.parentElement?.classList.contains('image-wrapper') ? selectedImage.parentElement : selectedImage}
    <div
      class={styles.imageDropdown}
      style="position: fixed; top: {imageWrapper.getBoundingClientRect().bottom + 10}px; left: {Math.max(10, Math.min(imageWrapper.getBoundingClientRect().left + (imageWrapper.getBoundingClientRect().width / 2) - 180, window.innerWidth - 370))}px; z-index: 10000; min-width: 360px; max-width: 90%;"
    >
      <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">이미지 편집</h3>
      <div class={styles.imageOptions} style="margin-bottom: 0;">
        <div class={styles.imageOptionRow}>
          <label>크기</label>
          <div class={styles.imageSizeButtons}>
            <button
              type="button"
              class={editImageWidth === '100%' ? styles.active : ''}
              onclick={() => editImageWidth = '100%'}
            >
              100%
            </button>
            <button
              type="button"
              class={editImageWidth === '75%' ? styles.active : ''}
              onclick={() => editImageWidth = '75%'}
            >
              75%
            </button>
            <button
              type="button"
              class={editImageWidth === '50%' ? styles.active : ''}
              onclick={() => editImageWidth = '50%'}
            >
              50%
            </button>
            <button
              type="button"
              class={editImageWidth === 'original' ? styles.active : ''}
              onclick={() => editImageWidth = 'original'}
            >
              원본
            </button>
          </div>
        </div>

        <div class={styles.imageOptionRow}>
          <label>정렬</label>
          <div class={styles.imageAlignButtons}>
            <button
              type="button"
              class={editImageAlign === 'left' ? styles.active : ''}
              onclick={() => editImageAlign = 'left'}
              title="왼쪽 정렬"
            >
              <i class={styles.alignLeft}></i>
            </button>
            <button
              type="button"
              class={editImageAlign === 'center' ? styles.active : ''}
              onclick={() => editImageAlign = 'center'}
              title="가운데 정렬"
            >
              <i class={styles.alignCenter}></i>
            </button>
            <button
              type="button"
              class={editImageAlign === 'right' ? styles.active : ''}
              onclick={() => editImageAlign = 'right'}
              title="오른쪽 정렬"
            >
              <i class={styles.alignRight}></i>
            </button>
          </div>
        </div>

        <div class={styles.imageOptionRow}>
          <label>대체 텍스트</label>
          <input
            type="text"
            bind:value={editImageAlt}
            placeholder="이미지 설명..."
          />
        </div>
      </div>

      <div class={styles.imageActions}>
        <button
          type="button"
          onclick={deleteImage}
          class={styles.danger}
        >
          삭제
        </button>
        <div style="display: flex; gap: 8px;">
          <button
            type="button"
            onclick={() => {
              deselectImage();
            }}
            class={styles.default}
          >
            취소
          </button>
          <button
            type="button"
            onclick={applyImageEdit}
            class={styles.primary}
          >
            적용
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- 유튜브 편집 팝업 -->
  {#if isYoutubeEditPopupOpen && selectedYoutube}
    {@const youtubeWrapper = selectedYoutube.parentElement?.classList.contains('youtube-wrapper') ? selectedYoutube.parentElement : selectedYoutube}
    <div
      class={styles.imageDropdown}
      style="position: fixed; top: {youtubeWrapper.getBoundingClientRect().bottom + 10}px; left: {Math.max(10, Math.min(youtubeWrapper.getBoundingClientRect().left + (youtubeWrapper.getBoundingClientRect().width / 2) - 180, window.innerWidth - 370))}px; z-index: 10000; min-width: 360px; max-width: 90%;"
    >
      <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">유튜브 편집</h3>
      <div class={styles.imageOptions} style="margin-bottom: 0;">
        <div class={styles.imageOptionRow}>
          <label>크기</label>
          <div class={styles.imageSizeButtons}>
            <button
              type="button"
              class={editYoutubeWidth === '100%' ? styles.active : ''}
              onclick={() => editYoutubeWidth = '100%'}
            >
              100%
            </button>
            <button
              type="button"
              class={editYoutubeWidth === '75%' ? styles.active : ''}
              onclick={() => editYoutubeWidth = '75%'}
            >
              75%
            </button>
            <button
              type="button"
              class={editYoutubeWidth === '50%' ? styles.active : ''}
              onclick={() => editYoutubeWidth = '50%'}
            >
              50%
            </button>
          </div>
        </div>

        <div class={styles.imageOptionRow}>
          <label>정렬</label>
          <div class={styles.imageAlignButtons}>
            <button
              type="button"
              class={editYoutubeAlign === 'left' ? styles.active : ''}
              onclick={() => editYoutubeAlign = 'left'}
              title="왼쪽 정렬"
            >
              <i class={styles.alignLeft}></i>
            </button>
            <button
              type="button"
              class={editYoutubeAlign === 'center' ? styles.active : ''}
              onclick={() => editYoutubeAlign = 'center'}
              title="가운데 정렬"
            >
              <i class={styles.alignCenter}></i>
            </button>
            <button
              type="button"
              class={editYoutubeAlign === 'right' ? styles.active : ''}
              onclick={() => editYoutubeAlign = 'right'}
              title="오른쪽 정렬"
            >
              <i class={styles.alignRight}></i>
            </button>
          </div>
        </div>
      </div>

      <div class={styles.imageActions}>
        <button
          type="button"
          onclick={deleteYoutube}
          class={styles.danger}
        >
          삭제
        </button>
        <div style="display: flex; gap: 8px;">
          <button
            type="button"
            onclick={() => {
              deselectYoutube();
            }}
            class={styles.default}
          >
            취소
          </button>
          <button
            type="button"
            onclick={applyYoutubeEdit}
            class={styles.primary}
          >
            적용
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Validation message -->
  {#if validator && $message}
    <div class="validator" role="alert">
      {$message}
    </div>
  {/if}
</div>

<style>
  :global(.validator) {
    color: var(--color-danger);
    font-size: 12px;
    margin-top: 4px;
  }
</style>
