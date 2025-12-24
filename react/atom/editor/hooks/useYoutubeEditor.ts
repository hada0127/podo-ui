import { useState, useCallback, useEffect, RefObject } from 'react';
import { UseSelectionManagerReturn } from './useSelectionManager';

export interface UseYoutubeEditorProps {
  editorRef: RefObject<HTMLDivElement>;
  selectionManager: UseSelectionManagerReturn;
  onInput?: () => void;
  onOtherDropdownsClose?: () => void; // 다른 드롭다운 닫기 콜백
}

export interface UseYoutubeEditorReturn {
  // 유튜브 삽입 드롭다운 상태
  isYoutubeDropdownOpen: boolean;
  youtubeUrl: string;
  youtubeWidth: string;
  youtubeAlign: string;

  // 유튜브 편집 팝업 상태
  selectedYoutube: HTMLElement | null;
  isYoutubeEditPopupOpen: boolean;
  editYoutubeWidth: string;
  editYoutubeAlign: string;

  // 리사이즈 상태
  isResizing: boolean;

  // Setter
  setIsYoutubeDropdownOpen: (open: boolean) => void;
  setYoutubeUrl: (url: string) => void;
  setYoutubeWidth: (width: string) => void;
  setYoutubeAlign: (align: string) => void;
  setIsYoutubeEditPopupOpen: (open: boolean) => void;
  setEditYoutubeWidth: (width: string) => void;
  setEditYoutubeAlign: (align: string) => void;

  // 함수
  openYoutubeDropdown: () => void;
  closeYoutubeDropdown: () => void;
  insertYoutubeEmbed: () => void;
  handleYoutubeClick: (youtubeElement: HTMLElement) => void;
  unselectYoutube: () => void;
  applyYoutubeEdit: () => void;
  deleteYoutube: () => void;
  closeYoutubeEditPopup: () => void;
}

interface ResizeStartData {
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  handle: string;
}

/**
 * 에디터 유튜브 관리 Hook
 *
 * 유튜브 비디오 삽입, 편집, 리사이즈 기능을 제공합니다.
 * iframe을 youtube-wrapper로 감싸고 16:9 비율을 유지합니다.
 *
 * @param {UseYoutubeEditorProps} props - Hook 설정
 * @returns {UseYoutubeEditorReturn} 유튜브 관리 상태 및 함수
 *
 * @example
 * ```tsx
 * const youtubeEditor = useYoutubeEditor({
 *   editorRef,
 *   selectionManager,
 *   onInput: handleInput,
 *   onOtherDropdownsClose: () => {
 *     setIsImageDropdownOpen(false);
 *     setIsLinkDropdownOpen(false);
 *   }
 * });
 *
 * // 유튜브 삽입
 * youtubeEditor.setYoutubeUrl('https://www.youtube.com/watch?v=VIDEO_ID');
 * youtubeEditor.setYoutubeWidth('560');
 * youtubeEditor.setYoutubeAlign('center');
 * youtubeEditor.insertYoutubeEmbed();
 * ```
 */
export const useYoutubeEditor = ({
  editorRef,
  selectionManager,
  onInput,
  onOtherDropdownsClose,
}: UseYoutubeEditorProps): UseYoutubeEditorReturn => {
  // 유튜브 삽입 드롭다운 상태
  const [isYoutubeDropdownOpen, setIsYoutubeDropdownOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeWidth, setYoutubeWidth] = useState('100%');
  const [youtubeAlign, setYoutubeAlign] = useState('center');

  // 유튜브 편집 팝업 상태
  const [selectedYoutube, setSelectedYoutube] = useState<HTMLElement | null>(null);
  const [isYoutubeEditPopupOpen, setIsYoutubeEditPopupOpen] = useState(false);
  const [editYoutubeWidth, setEditYoutubeWidth] = useState('100%');
  const [editYoutubeAlign, setEditYoutubeAlign] = useState('center');

  // 리사이즈 상태
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartData, setResizeStartData] = useState<ResizeStartData | null>(null);

  /**
   * 유튜브 드롭다운 열기
   */
  const openYoutubeDropdown = useCallback(() => {
    setIsYoutubeDropdownOpen(true);

    // 다른 드롭다운 닫기
    if (onOtherDropdownsClose) {
      onOtherDropdownsClose();
    }
  }, [onOtherDropdownsClose]);

  /**
   * 유튜브 드롭다운 닫기
   */
  const closeYoutubeDropdown = useCallback(() => {
    setIsYoutubeDropdownOpen(false);
    setYoutubeUrl('');
    setYoutubeWidth('100%');
    setYoutubeAlign('left');
  }, []);

  /**
   * 유튜브 비디오 ID 추출
   */
  const extractYoutubeVideoId = useCallback((url: string): string | null => {
    // https://www.youtube.com/watch?v=VIDEO_ID
    // https://youtu.be/VIDEO_ID
    // https://www.youtube.com/embed/VIDEO_ID
    const patterns = [
      /youtube\.com\/watch\?v=([^&]+)/,
      /youtu\.be\/([^?]+)/,
      /youtube\.com\/embed\/([^?]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }, []);

  /**
   * 유튜브 삽입 (레거시 방식)
   */
  const insertYoutubeEmbed = useCallback(() => {
    if (!youtubeUrl) {
      alert('유튜브 URL을 입력해주세요.');
      return;
    }

    const videoId = extractYoutubeVideoId(youtubeUrl);
    if (!videoId) {
      alert('올바른 유튜브 URL이 아닙니다.');
      return;
    }

    if (!editorRef.current) return;

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
    if (youtubeWidth === '100%' || youtubeWidth === '75%' || youtubeWidth === '50%') {
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
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
    iframe.style.width = '100%';
    iframe.style.height = 'auto';
    iframe.style.aspectRatio = '16 / 9';
    iframe.style.display = 'block';
    iframe.style.pointerEvents = 'none'; // 편집 모드에서 iframe 클릭 방지

    // 투명 오버레이 추가 (클릭 방지)
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

    // 에디터에 삽입
    editorRef.current.focus();
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(alignContainer);

      // 유튜브 다음에 새 문단 추가
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
      editorRef.current.appendChild(alignContainer);
    }

    // 상태 초기화
    setYoutubeUrl('');
    setYoutubeWidth('100%');
    setYoutubeAlign('center');
    setIsYoutubeDropdownOpen(false);

    if (onInput) {
      onInput();
    }
  }, [youtubeUrl, youtubeWidth, youtubeAlign, editorRef, extractYoutubeVideoId, onInput]);

  /**
   * 유튜브 리사이즈 시작 (레거시 방식)
   */
  const startYoutubeResize = useCallback((e: MouseEvent, container: HTMLElement, handle: string) => {
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
  }, []);

  /**
   * 유튜브 선택 해제 (레거시 방식 - wrapper 제거하고 container 복원)
   */
  const unselectYoutube = useCallback(() => {
    if (!selectedYoutube) return;

    // wrapper 찾기
    const wrapper = selectedYoutube.parentElement;
    if (wrapper && wrapper.classList.contains('youtube-wrapper')) {
      // wrapper의 부모 찾기
      const parent = wrapper.parentElement;
      if (parent) {
        // wrapper를 제거하고 container를 직접 parent에 추가
        parent.insertBefore(selectedYoutube, wrapper);
        wrapper.remove();
      }

      // 원본 스타일 복원 (필요한 경우)
      if (selectedYoutube.dataset.originalDisplay) {
        selectedYoutube.style.display = selectedYoutube.dataset.originalDisplay;
        delete selectedYoutube.dataset.originalDisplay;
      }
      if (selectedYoutube.dataset.originalWidth) {
        delete selectedYoutube.dataset.originalWidth;
      }
    }

    setSelectedYoutube(null);
  }, [selectedYoutube]);

  /**
   * 리사이즈 핸들 추가 (레거시 방식)
   */
  const addResizeHandles = useCallback((wrapper: HTMLElement, youtubeContainer: HTMLElement) => {
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
        case 'nw':
          handleDiv.style.top = '-5px';
          handleDiv.style.left = '-5px';
          break;
        case 'n':
          handleDiv.style.top = '-5px';
          handleDiv.style.left = '50%';
          handleDiv.style.transform = 'translateX(-50%)';
          break;
        case 'ne':
          handleDiv.style.top = '-5px';
          handleDiv.style.right = '-5px';
          break;
        case 'e':
          handleDiv.style.top = '50%';
          handleDiv.style.right = '-5px';
          handleDiv.style.transform = 'translateY(-50%)';
          break;
        case 'se':
          handleDiv.style.bottom = '-5px';
          handleDiv.style.right = '-5px';
          break;
        case 's':
          handleDiv.style.bottom = '-5px';
          handleDiv.style.left = '50%';
          handleDiv.style.transform = 'translateX(-50%)';
          break;
        case 'sw':
          handleDiv.style.bottom = '-5px';
          handleDiv.style.left = '-5px';
          break;
        case 'w':
          handleDiv.style.top = '50%';
          handleDiv.style.left = '-5px';
          handleDiv.style.transform = 'translateY(-50%)';
          break;
      }

      // 리사이즈 이벤트 핸들러 바인딩
      handleDiv.onmousedown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        startYoutubeResize(e, youtubeContainer, handle);
      };

      wrapper.appendChild(handleDiv);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * 유튜브 클릭 핸들러 (레거시 방식 - youtube-container를 wrapper로 감쌈)
   */
  const handleYoutubeClick = useCallback((youtubeContainer: HTMLElement) => {
    // 기존 선택 해제
    if (selectedYoutube) {
      unselectYoutube();
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
    wrapper.style.width = youtubeContainer.style.width || computedStyle.width;

    // 원본 스타일 저장 (나중에 복원용)
    youtubeContainer.dataset.originalWidth = youtubeContainer.style.width;
    youtubeContainer.dataset.originalDisplay = youtubeContainer.style.display;

    // 리사이즈 핸들 추가 (8개 포인트)
    addResizeHandles(wrapper, youtubeContainer);

    // 유튜브를 wrapper로 감싸기
    const parent = youtubeContainer.parentNode;
    parent?.insertBefore(wrapper, youtubeContainer);
    wrapper.appendChild(youtubeContainer);

    // 편집 팝업 데이터 설정
    if (youtubeContainer.style.width) {
      setEditYoutubeWidth(youtubeContainer.style.width);
    }

    // 부모 alignContainer의 정렬 확인
    const alignContainer = wrapper.parentElement;
    if (alignContainer) {
      const align = alignContainer.style.textAlign || 'center';
      setEditYoutubeAlign(align);
    }

    setIsYoutubeEditPopupOpen(true);
  }, [selectedYoutube, unselectYoutube, addResizeHandles]);

  /**
   * 유튜브 편집 적용 (레거시 방식)
   */
  const applyYoutubeEdit = useCallback(() => {
    if (!selectedYoutube) return;

    // 크기 적용
    if (editYoutubeWidth === '100%' || editYoutubeWidth === '75%' || editYoutubeWidth === '50%') {
      // 퍼센트 값은 그대로 유지
      selectedYoutube.style.width = editYoutubeWidth;
      selectedYoutube.style.aspectRatio = '16 / 9';
      selectedYoutube.style.height = 'auto';
    } else if (editYoutubeWidth.endsWith('px')) {
      // px 값은 그대로 설정 (리사이즈로 변경된 경우)
      selectedYoutube.style.aspectRatio = '';
      selectedYoutube.style.width = editYoutubeWidth;
      // height 계산
      const width = parseInt(editYoutubeWidth);
      const height = width / (16 / 9);
      selectedYoutube.style.height = height + 'px';
    } else if (editYoutubeWidth.endsWith('%')) {
      // 기타 % 값
      selectedYoutube.style.width = editYoutubeWidth;
      selectedYoutube.style.aspectRatio = '16 / 9';
      selectedYoutube.style.height = 'auto';
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
    if (alignContainer && alignContainer.tagName === 'DIV' && alignContainer !== editorRef.current) {
      alignContainer.style.textAlign = editYoutubeAlign;

      // 유튜브 컨테이너 자체도 적절한 display 설정
      selectedYoutube.style.display = 'inline-block';
    }

    setIsYoutubeEditPopupOpen(false);
    unselectYoutube();

    if (onInput) {
      onInput();
    }
  }, [selectedYoutube, editYoutubeWidth, editYoutubeAlign, editorRef, unselectYoutube, onInput]);

  /**
   * 유튜브 삭제 (레거시 방식 - wrapper와 alignContainer 모두 삭제)
   */
  const deleteYoutube = useCallback(() => {
    if (!selectedYoutube) return;

    const youtubeToDelete = selectedYoutube;
    setSelectedYoutube(null);
    setIsYoutubeEditPopupOpen(false);

    let elementToRemove: HTMLElement = youtubeToDelete;
    let parent = youtubeToDelete.parentElement;

    // wrapper와 alignContainer를 모두 찾아서 삭제
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

    editorRef.current?.focus();

    if (onInput) {
      onInput();
    }
  }, [selectedYoutube, editorRef, onInput]);

  /**
   * 유튜브 편집 팝업 닫기
   */
  const closeYoutubeEditPopup = useCallback(() => {
    setIsYoutubeEditPopupOpen(false);
    unselectYoutube();
  }, [unselectYoutube]);

  /**
   * 리사이즈 이벤트 핸들링 (레거시 방식)
   */
  useEffect(() => {
    if (!isResizing || !resizeStartData || !selectedYoutube) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeStartData) return;

      const deltaX = e.clientX - resizeStartData.startX;
      const deltaY = e.clientY - resizeStartData.startY;

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
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeStartData(null);

      if (selectedYoutube) {
        // 유튜브 크기는 이미 px로 설정되어 있으므로,
        // 편집창의 width 값만 업데이트 (실제 DOM은 변경하지 않음)
        const currentWidth = selectedYoutube.style.width;
        setEditYoutubeWidth(currentWidth);

        // 변경된 크기를 새로운 원본으로 설정 (선택 해제 시 이 크기로 복원됨)
        selectedYoutube.dataset.originalWidth = currentWidth;
      }

      if (onInput) {
        onInput();
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeStartData, selectedYoutube, editorRef, onInput]);

  /**
   * 에디터 클릭 시 유튜브 선택 해제
   */
  useEffect(() => {
    const handleEditorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // 유튜브 wrapper나 그 자식을 클릭한 경우 무시
      if (target.closest('.youtube-wrapper')) {
        return;
      }

      // 리사이즈 핸들 클릭 시 무시
      if (target.classList.contains('resize-handle')) {
        return;
      }

      // 유튜브 편집 팝업 클릭 시 무시
      if (target.closest('.youtube-edit-popup')) {
        return;
      }

      // 그 외의 경우 유튜브 선택 해제
      if (selectedYoutube) {
        unselectYoutube();
      }
    };

    if (editorRef.current) {
      editorRef.current.addEventListener('click', handleEditorClick);
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.removeEventListener('click', handleEditorClick);
      }
    };
  }, [selectedYoutube, editorRef, unselectYoutube]);

  return {
    // 유튜브 삽입 드롭다운 상태
    isYoutubeDropdownOpen,
    youtubeUrl,
    youtubeWidth,
    youtubeAlign,

    // 유튜브 편집 팝업 상태
    selectedYoutube,
    isYoutubeEditPopupOpen,
    editYoutubeWidth,
    editYoutubeAlign,

    // 리사이즈 상태
    isResizing,

    // Setter
    setIsYoutubeDropdownOpen,
    setYoutubeUrl,
    setYoutubeWidth,
    setYoutubeAlign,
    setIsYoutubeEditPopupOpen,
    setEditYoutubeWidth,
    setEditYoutubeAlign,

    // 함수
    openYoutubeDropdown,
    closeYoutubeDropdown,
    insertYoutubeEmbed,
    handleYoutubeClick,
    unselectYoutube,
    applyYoutubeEdit,
    deleteYoutube,
    closeYoutubeEditPopup,
  };
};
