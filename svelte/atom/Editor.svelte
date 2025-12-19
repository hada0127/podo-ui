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

  // Dropdown position state
  let imageDropdownPos = $state({ top: 0, left: 0 });
  let youtubeDropdownPos = $state({ top: 0, left: 0 });
  let textColorDropdownPos = $state({ top: 0, left: 0 });
  let bgColorDropdownPos = $state({ top: 0, left: 0 });
  let alignDropdownPos = $state({ top: 0, left: 0 });
  let paragraphDropdownPos = $state({ top: 0, left: 0 });

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
        onchange?.(content);
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
        onchange?.(content);
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
      value = content;
      onchange?.(content);
      validateHandler(content);
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
      value = content;
      onchange?.(content);
      validateHandler(content);
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

        if (tagName === 'SPAN' || tagName === 'P' || tagName === 'DIV') {
          const style = (element as HTMLElement).style;
          const allowedStyles: string[] = [];

          if (style.color) allowedStyles.push(`color: ${style.color}`);
          if (style.backgroundColor) allowedStyles.push(`background-color: ${style.backgroundColor}`);
          if (style.textAlign) allowedStyles.push(`text-align: ${style.textAlign}`);

          if (allowedStyles.length > 0) {
            newElement.setAttribute('style', allowedStyles.join('; '));
          }
        }

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
      document.execCommand('insertText', false, text);
    }

    handleInput();
  };

  // Text formatting commands
  const execCommand = (command: string, value?: string) => {
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
    execCommand('strikethrough');
    detectTextStyles();
  };
  const removeFormat = () => {
    execCommand('removeFormat');
    detectTextStyles();
  };

  const setTextColor = (color: string) => {
    // 에디터에 포커스
    editorRef?.focus();

    // 저장된 선택 영역 복원
    if (savedSelection) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelection);
      }
    }

    // 색상 적용 - span 태그에 !important 스타일 사용
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      try {
        const range = selection.getRangeAt(0);
        const contents = range.extractContents();
        const span = document.createElement('span');
        span.setAttribute('style', `color: ${color} !important;`);
        span.appendChild(contents);
        range.insertNode(span);

        // 커서 위치 조정
        range.selectNodeContents(span);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      } catch {
        // fallback
        document.execCommand('foreColor', false, color);
      }
    }

    isTextColorOpen = false;
    savedSelection = null;
    handleInput();
  };

  const setBackgroundColor = (color: string) => {
    // 에디터에 포커스
    editorRef?.focus();

    // 저장된 선택 영역 복원
    if (savedSelection) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelection);
      }
    }

    // 배경색 적용 - span 태그에 !important 스타일 사용
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      try {
        const range = selection.getRangeAt(0);
        const contents = range.extractContents();
        const span = document.createElement('span');
        span.setAttribute('style', `background-color: ${color} !important;`);
        span.appendChild(contents);
        range.insertNode(span);

        // 커서 위치 조정
        range.selectNodeContents(span);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      } catch {
        // fallback
        document.execCommand('hiliteColor', false, color);
      }
    }

    isBgColorOpen = false;
    savedSelection = null;
    handleInput();
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
      document.execCommand('formatBlock', false, format.toUpperCase());
    } else if (format === 'p') {
      document.execCommand('formatBlock', false, 'P');
    } else if (format.startsWith('p') && (format.match(/p[1-5](_semibold)?/))) {
      document.execCommand('formatBlock', false, 'P');

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

  // Code view toggle
  const toggleCodeView = () => {
    if (!editorRef) return;

    if (!isCodeView) {
      // Switch to code view
      savedEditorHeight = editorRef.offsetHeight;
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
      if (editorRef) {
        editorRef.innerHTML = codeContent.replace(/\n/g, '');
        handleInput();
      }
      isCodeView = false;
    }
  };

  // Keydown handler
  const handleKeyDown = (e: KeyboardEvent) => {
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
  };

  // Initialize value
  $effect(() => {
    if (editorRef && value !== editorRef.innerHTML && !isUndoRedo) {
      editorRef.innerHTML = value;
    }
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
          title="실행 취소 (Ctrl+Z)"
        >
          <i class={styles.undo}></i>
        </button>
        <button
          type="button"
          class={styles.toolbarButton}
          onmousedown={(e) => e.preventDefault()}
          onclick={performRedo}
          disabled={historyIndex >= history.length - 1}
          title="다시 실행 (Ctrl+Y)"
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

    <!-- Align -->
    {#if isToolbarItemEnabled('align')}
      <div class={styles.toolbarGroup}>
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
      </div>
    {/if}

    <!-- List -->
    {#if isToolbarItemEnabled('list')}
      <div class={styles.toolbarGroup}>
        <button type="button" class={styles.toolbarButton} onmousedown={(e) => e.preventDefault()} onclick={() => insertList(false)} title="목록">
          <i class={styles.listUl}></i>
        </button>
        <button type="button" class={styles.toolbarButton} onmousedown={(e) => e.preventDefault()} onclick={() => insertList(true)} title="번호 목록">
          <i class={styles.listOl}></i>
        </button>
      </div>
    {/if}

    <!-- Table -->
    {#if isToolbarItemEnabled('table')}
      <div class={styles.toolbarGroup}>
        <div class={styles.tableButton}>
          <button
            type="button"
            class={styles.toolbarButton}
            onmousedown={(e) => e.preventDefault()}
            onclick={() => {
              const selection = window.getSelection();
              if (selection && selection.rangeCount > 0) {
                savedTableSelection = selection.getRangeAt(0).cloneRange();
              }
              isTableDropdownOpen = !isTableDropdownOpen;
            }}
            title="표 삽입"
          >
            <i class={styles.table}></i>
          </button>
          {#if isTableDropdownOpen}
            <div class={styles.tableDropdown}>
              <div class={styles.tableGrid}>
                {#each Array(6) as _, row}
                  <div class={styles.tableGridRow}>
                    {#each Array(6) as _, col}
                      <button
                        type="button"
                        class="{styles.tableGridCell} {row <= tableRows - 1 && col <= tableCols - 1 ? styles.selected : ''}"
                        onmouseenter={() => { tableRows = row + 1; tableCols = col + 1; }}
                        onclick={() => insertTable(row + 1, col + 1)}
                      ></button>
                    {/each}
                  </div>
                {/each}
              </div>
              <div class={styles.tableSize}>{tableRows} x {tableCols}</div>
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <!-- Link -->
    {#if isToolbarItemEnabled('link')}
      <div class={styles.toolbarGroup}>
        <div class={styles.linkButton}>
          <button
            type="button"
            class={styles.toolbarButton}
            onmousedown={(e) => e.preventDefault()}
            onclick={() => {
              const selection = window.getSelection();
              if (selection && selection.rangeCount > 0) {
                savedSelection = selection.getRangeAt(0).cloneRange();
              }
              isLinkDropdownOpen = !isLinkDropdownOpen;
            }}
            title="링크 삽입"
          >
            <i class={styles.link}></i>
          </button>
          {#if isLinkDropdownOpen}
            <div class={styles.linkDropdown}>
              <div class={styles.linkInput}>
                <input
                  type="text"
                  placeholder="URL을 입력하세요"
                  bind:value={linkUrl}
                  onkeydown={(e) => e.key === 'Enter' && insertLink()}
                />
              </div>
              <div class={styles.linkTarget}>
                <label>
                  <input type="radio" bind:group={linkTarget} value="_blank" /> 새 탭
                </label>
                <label>
                  <input type="radio" bind:group={linkTarget} value="_self" /> 현재 탭
                </label>
              </div>
              <button type="button" class={styles.linkInsertButton} onclick={insertLink}>
                삽입
              </button>
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <!-- Image -->
    {#if isToolbarItemEnabled('image')}
      <div class={styles.toolbarGroup}>
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
      </div>
    {/if}

    <!-- YouTube -->
    {#if isToolbarItemEnabled('youtube')}
      <div class={styles.toolbarGroup}>
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
        onclick={() => {
          detectCurrentParagraphStyle();
          detectCurrentAlign();
          detectTextStyles();
        }}
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
