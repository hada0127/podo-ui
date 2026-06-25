// @ts-nocheck
/* eslint-disable */
// VENDORED from origin/dev react/atom/editor/hooks/useImageEditor.ts — do not hand-edit; re-vendor via packages/editor/scripts/vendor-v1-editor.mjs.
import { useState, useCallback, RefObject, useEffect } from 'react';
import { UseSelectionManagerReturn } from './useSelectionManager.js';

export interface UseImageEditorProps {
  editorRef: RefObject<HTMLDivElement>;
  selectionManager: UseSelectionManagerReturn;
  onInput?: () => void;
  fileInputRef?: RefObject<HTMLInputElement>;
}

export interface UseImageEditorReturn {
  // 드롭다운 상태
  isImageDropdownOpen: boolean;
  imageTabMode: 'file' | 'url';
  imageUrl: string;
  imageWidth: string;
  imageAlign: string;
  imageAlt: string;
  imageFile: File | null;
  imagePreview: string;

  // 편집 상태
  selectedImage: HTMLImageElement | null;
  isImageEditPopupOpen: boolean;
  editImageWidth: string;
  editImageAlign: string;
  editImageAlt: string;
  isResizing: boolean;

  // Setter
  setIsImageDropdownOpen: (open: boolean) => void;
  setImageTabMode: (mode: 'file' | 'url') => void;
  setImageUrl: (url: string) => void;
  setImageWidth: (width: string) => void;
  setImageAlign: (align: string) => void;
  setImageAlt: (alt: string) => void;
  setImageFile: (file: File | null) => void;
  setImagePreview: (preview: string) => void;
  setIsImageEditPopupOpen: (open: boolean) => void;
  setEditImageWidth: (width: string) => void;
  setEditImageAlign: (align: string) => void;
  setEditImageAlt: (alt: string) => void;

  // 함수
  openImageDropdown: (e?: React.MouseEvent) => void;
  closeImageDropdown: () => void;
  insertImage: () => Promise<void>;
  handleImageFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleImageClick: (img: HTMLImageElement) => void;
  unselectImage: () => void;
  applyImageEdit: () => void;
  deleteImage: () => void;
  insertImageAtCursor: (src: string, alt?: string) => void;
}

/**
 * 에디터 이미지 관리 Hook
 *
 * 이미지 삽입, 편집, 삭제, 리사이즈 기능을 제공합니다.
 * 파일 업로드와 URL 입력 두 가지 방식을 지원합니다.
 *
 * @param {UseImageEditorProps} props - Hook 설정
 * @returns {UseImageEditorReturn} 이미지 관리 상태 및 함수
 */
export const useImageEditor = ({
  editorRef,
  selectionManager,
  onInput,
  fileInputRef,
}: UseImageEditorProps): UseImageEditorReturn => {
  // 드롭다운 상태
  const [isImageDropdownOpen, setIsImageDropdownOpen] = useState(false);
  const [imageTabMode, setImageTabMode] = useState<'file' | 'url'>('file');
  const [imageUrl, setImageUrl] = useState('');
  const [imageWidth, setImageWidth] = useState('original');
  const [imageAlign, setImageAlign] = useState('left');
  const [imageAlt, setImageAlt] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  // 편집 상태
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [isImageEditPopupOpen, setIsImageEditPopupOpen] = useState(false);
  const [editImageWidth, setEditImageWidth] = useState('');
  const [editImageAlign, setEditImageAlign] = useState('left');
  const [editImageAlt, setEditImageAlt] = useState('');
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartData, setResizeStartData] = useState<{
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    handle: string;
  } | null>(null);

  /**
   * 커서 위치에 이미지 삽입
   */
  const insertImageAtCursor = useCallback((src: string, alt = '') => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.style.maxWidth = '100%';

    range.deleteContents();
    range.insertNode(img);

    // 커서를 이미지 다음으로 이동
    const newRange = document.createRange();
    newRange.setStartAfter(img);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);

    if (onInput) {
      onInput();
    }
  }, [onInput]);

  /**
   * 이미지 드롭다운 열기
   */
  const openImageDropdown = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();

    // 현재 선택 영역 저장
    selectionManager.saveSelection();

    setIsImageDropdownOpen(true);
    setImageTabMode('file');
  }, [selectionManager]);

  /**
   * 이미지 드롭다운 닫기
   */
  const closeImageDropdown = useCallback(() => {
    setIsImageDropdownOpen(false);
    setImageTabMode('file');
    setImageUrl('');
    setImageFile(null);
    setImagePreview('');
    setImageWidth('original');
    setImageAlign('left');
    setImageAlt('');
  }, []);

  /**
   * 이미지 파일 변경 핸들러
   */
  const handleImageFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  /**
   * 이미지 삽입
   */
  const insertImage = useCallback(async () => {
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
        alert(`이미지를 불러올 수 없습니다.\n\n가능한 원인:\n1. 잘못된 이미지 URL\n2. CORS 정책으로 인한 차단 (외부 도메인)\n3. 네트워크 연결 문제\n4. 이미지가 존재하지 않음\n\nURL: ${imageUrl}\n\n💡 팁: CORS 정책으로 차단된 경우, 이미지를 직접 다운로드 후 파일 업로드를 사용해주세요.`);
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

    // 이미지 로드 에러 처리
    img.onerror = () => {
      alert(`이미지를 불러올 수 없습니다.\n\n가능한 원인:\n1. 잘못된 이미지 URL\n2. CORS 정책으로 인한 차단\n3. 네트워크 연결 문제\n\nURL: ${imageSrc}`);

      if (img.parentNode) {
        img.parentNode.removeChild(img);
      }
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

    // 컨테이너 div 생성 (정렬용)
    const container = document.createElement('div');
    container.style.textAlign = imageAlign;
    container.appendChild(img);

    // 에디터에 포커스 먼저 설정
    if (editorRef.current) {
      editorRef.current.focus();

      const selection = window.getSelection();

      // 저장된 선택 영역이 있으면 복원
      if (selectionManager.selection && selection) {
        try {
          selection.removeAllRanges();
          selection.addRange(selectionManager.selection);
        } catch {
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
    setImageTabMode('file');
    setImageUrl('');
    setImageFile(null);
    setImagePreview('');
    setImageWidth('original');
    setImageAlign('left');
    setImageAlt('');

    if (fileInputRef?.current) {
      fileInputRef.current.value = '';
    }

    if (onInput) {
      onInput();
    }
  }, [imageFile, imagePreview, imageUrl, imageAlt, imageWidth, imageAlign, editorRef, selectionManager, fileInputRef, onInput]);

  /**
   * 리사이즈 시작
   */
  const startResize = useCallback((e: MouseEvent, img: HTMLImageElement, handle: string) => {
    setIsResizing(true);
    setResizeStartData({
      startX: e.clientX,
      startY: e.clientY,
      startWidth: img.offsetWidth,
      startHeight: img.offsetHeight,
      handle
    });
  }, []);

  /**
   * 이미지 선택 (편집 모드)
   */
  const handleImageClick = useCallback((img: HTMLImageElement) => {
    // 기존 선택 해제
    if (selectedImage && selectedImage !== img) {
      unselectImage();
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
    if (img.style.width) {
      setEditImageWidth(img.style.width);
    } else {
      setEditImageWidth('original');
    }

    // 이미지의 정렬 상태 확인
    let container = img.parentElement;
    let currentAlign = 'left';

    while (container && container !== editorRef.current) {
      if (container.tagName === 'DIV' && container.style.textAlign) {
        currentAlign = container.style.textAlign;
        break;
      }
      container = container.parentElement;
    }

    setEditImageAlign(currentAlign);
    setEditImageAlt(img.alt || '');

    setTimeout(() => {
      setIsImageEditPopupOpen(true);
    }, 50);
  }, [selectedImage, editorRef, startResize]);

  /**
   * 이미지 선택 해제
   */
  const unselectImage = useCallback(() => {
    if (!selectedImage) return;

    // wrapper 제거
    const wrapper = selectedImage.parentElement;
    if (wrapper && wrapper.classList.contains('image-wrapper')) {
      const parent = wrapper.parentNode;
      if (parent) {
        try {
          parent.insertBefore(selectedImage, wrapper);
          wrapper.remove();
        } catch {
          // 이미 제거된 경우 무시
        }
      }
    }

    if (selectedImage) {
      selectedImage.draggable = false;
    }

    setSelectedImage(null);
    setIsImageEditPopupOpen(false);
    setIsResizing(false);
    setResizeStartData(null);
  }, [selectedImage]);

  /**
   * 이미지 편집 적용
   */
  const applyImageEdit = useCallback(() => {
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

    if (alignContainer && alignContainer.tagName === 'DIV' && alignContainer !== editorRef.current) {
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

    unselectImage();

    if (onInput) {
      onInput();
    }
  }, [selectedImage, editImageWidth, editImageAlign, editImageAlt, editorRef, unselectImage, onInput]);

  /**
   * 이미지 삭제
   */
  const deleteImage = useCallback(() => {
    if (!selectedImage) return;

    const imageToDelete = selectedImage;
    unselectImage();

    // wrapper가 있으면 wrapper까지 삭제
    const wrapper = imageToDelete.parentElement;
    if (wrapper && wrapper.classList.contains('image-wrapper')) {
      wrapper.remove();
    } else {
      imageToDelete.remove();
    }

    if (onInput) {
      onInput();
    }
  }, [selectedImage, unselectImage, onInput]);

  // 리사이즈 이벤트 핸들러 (document 레벨)
  useEffect(() => {
    if (!isResizing || !resizeStartData || !selectedImage) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStartData.startX;
      const deltaY = e.clientY - resizeStartData.startY;
      const { handle, startWidth, startHeight } = resizeStartData;

      let newWidth = startWidth;
      let newHeight = startHeight;

      // 핸들 방향에 따라 크기 조정
      if (handle.includes('e')) {
        newWidth = startWidth + deltaX;
      } else if (handle.includes('w')) {
        newWidth = startWidth - deltaX;
      }

      if (handle.includes('s')) {
        newHeight = startHeight + deltaY;
      } else if (handle.includes('n')) {
        newHeight = startHeight - deltaY;
      }

      // 최소 크기 제한
      newWidth = Math.max(50, newWidth);
      newHeight = Math.max(50, newHeight);

      // 비율 유지
      const aspectRatio = startWidth / startHeight;
      if (handle === 'nw' || handle === 'ne' || handle === 'sw' || handle === 'se') {
        newHeight = newWidth / aspectRatio;
      }

      selectedImage.style.width = `${newWidth}px`;
      selectedImage.style.height = `${newHeight}px`;
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeStartData(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeStartData, selectedImage]);

  return {
    // 드롭다운 상태
    isImageDropdownOpen,
    imageTabMode,
    imageUrl,
    imageWidth,
    imageAlign,
    imageAlt,
    imageFile,
    imagePreview,

    // 편집 상태
    selectedImage,
    isImageEditPopupOpen,
    editImageWidth,
    editImageAlign,
    editImageAlt,
    isResizing,

    // Setter
    setIsImageDropdownOpen,
    setImageTabMode,
    setImageUrl,
    setImageWidth,
    setImageAlign,
    setImageAlt,
    setImageFile,
    setImagePreview,
    setIsImageEditPopupOpen,
    setEditImageWidth,
    setEditImageAlign,
    setEditImageAlt,

    // 함수
    openImageDropdown,
    closeImageDropdown,
    insertImage,
    handleImageFileChange,
    handleImageClick,
    unselectImage,
    applyImageEdit,
    deleteImage,
    insertImageAtCursor,
  };
};
