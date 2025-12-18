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
      addToHistory(content);
    }
  };

  // Insert image into editor
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

  const formatBold = () => execCommand('bold');
  const formatItalic = () => execCommand('italic');
  const formatUnderline = () => execCommand('underline');
  const formatStrikethrough = () => execCommand('strikethrough');
  const removeFormat = () => execCommand('removeFormat');

  const setTextColor = (color: string) => {
    execCommand('foreColor', color);
    isTextColorOpen = false;
  };

  const setBackgroundColor = (color: string) => {
    execCommand('hiliteColor', color);
    isBgColorOpen = false;
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
    if (!target.closest(`.${styles.imageDropdown}`) && !target.closest(`.${styles.imageButton}`)) {
      isImageDropdownOpen = false;
    }
    if (!target.closest(`.${styles.youtubeDropdown}`) && !target.closest(`.${styles.youtubeButton}`)) {
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
          onclick={performUndo}
          disabled={historyIndex <= 0}
          title="실행 취소 (Ctrl+Z)"
        >
          <i class={styles.undo}></i>
        </button>
        <button
          type="button"
          class={styles.toolbarButton}
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
        <button
          type="button"
          class={styles.paragraphButton}
          onclick={() => isParagraphDropdownOpen = !isParagraphDropdownOpen}
        >
          <span>{getCurrentStyleLabel()}</span>
          <i class={styles.dropdownArrow}></i>
        </button>
        {#if isParagraphDropdownOpen}
          <div class={styles.paragraphDropdown}>
            {#each paragraphOptions as option}
              <button
                type="button"
                class="{styles.paragraphOption} {option.className || ''}"
                onclick={() => setParagraphFormat(option.value)}
              >
                {option.label}
              </button>
            {/each}
          </div>
        {/if}
      </div>
    {/if}

    <!-- Text style -->
    {#if isToolbarItemEnabled('text-style')}
      <div class={styles.toolbarGroup}>
        <button type="button" class={styles.toolbarButton} onclick={formatBold} title="굵게 (Ctrl+B)">
          <i class={styles.bold}></i>
        </button>
        <button type="button" class={styles.toolbarButton} onclick={formatItalic} title="기울임 (Ctrl+I)">
          <i class={styles.italic}></i>
        </button>
        <button type="button" class={styles.toolbarButton} onclick={formatUnderline} title="밑줄 (Ctrl+U)">
          <i class={styles.underline}></i>
        </button>
        <button type="button" class={styles.toolbarButton} onclick={formatStrikethrough} title="취소선">
          <i class={styles.strikethrough}></i>
        </button>
      </div>
    {/if}

    <!-- Color -->
    {#if isToolbarItemEnabled('color')}
      <div class={styles.toolbarGroup}>
        <div class={styles.colorButton}>
          <button
            type="button"
            class={styles.toolbarButton}
            onclick={() => { isTextColorOpen = !isTextColorOpen; isBgColorOpen = false; }}
            title="글꼴 색상"
          >
            <i class={styles.fontColor}></i>
          </button>
          {#if isTextColorOpen}
            <div class={styles.colorDropdown}>
              <div class={styles.colorPalette}>
                {#each colorPalette as row}
                  <div class={styles.colorRow}>
                    {#each row as color}
                      <button
                        type="button"
                        class={styles.colorCell}
                        style="background-color: {color};"
                        onclick={() => setTextColor(color)}
                      ></button>
                    {/each}
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>
        <div class={styles.colorButton}>
          <button
            type="button"
            class={styles.toolbarButton}
            onclick={() => { isBgColorOpen = !isBgColorOpen; isTextColorOpen = false; }}
            title="배경 색상"
          >
            <i class={styles.highlight}></i>
          </button>
          {#if isBgColorOpen}
            <div class={styles.colorDropdown}>
              <div class={styles.colorPalette}>
                {#each colorPalette as row}
                  <div class={styles.colorRow}>
                    {#each row as color}
                      <button
                        type="button"
                        class={styles.colorCell}
                        style="background-color: {color};"
                        onclick={() => setBackgroundColor(color)}
                      ></button>
                    {/each}
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <!-- Align -->
    {#if isToolbarItemEnabled('align')}
      <div class={styles.toolbarGroup}>
        <div class={styles.alignButton}>
          <button
            type="button"
            class={styles.toolbarButton}
            onclick={() => isAlignDropdownOpen = !isAlignDropdownOpen}
            title={getCurrentAlignLabel()}
          >
            <span class={getCurrentAlignIcon()}></span>
            <i class={styles.dropdownArrow}></i>
          </button>
          {#if isAlignDropdownOpen}
            <div class={styles.alignDropdown}>
              {#each alignOptions as option}
                <button
                  type="button"
                  class={styles.alignOption}
                  onclick={() => setAlignment(option.value)}
                >
                  <span class={styles[option.icon]}></span>
                  {option.label}
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
        <button type="button" class={styles.toolbarButton} onclick={() => insertList(false)} title="목록">
          <i class={styles.listUl}></i>
        </button>
        <button type="button" class={styles.toolbarButton} onclick={() => insertList(true)} title="번호 목록">
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

    <!-- HR -->
    {#if isToolbarItemEnabled('hr')}
      <div class={styles.toolbarGroup}>
        <button type="button" class={styles.toolbarButton} onclick={insertHR} title="구분선">
          <i class={styles.hr}></i>
        </button>
      </div>
    {/if}

    <!-- Format clear -->
    {#if isToolbarItemEnabled('format')}
      <div class={styles.toolbarGroup}>
        <button type="button" class={styles.toolbarButton} onclick={removeFormat} title="서식 지우기">
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
          onclick={toggleCodeView}
          title="코드 보기"
        >
          <i class={styles.code}></i>
        </button>
      </div>
    {/if}
  </div>

  <!-- Editor content -->
  <div class={styles.editorWrapper} style={editorStyle}>
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
        onkeydown={handleKeyDown}
        role="textbox"
        aria-multiline="true"
        style={resizable ? 'resize: vertical;' : ''}
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
