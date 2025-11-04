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
  const editorRef = useRef<HTMLDivElement>(null);
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
  const [editorID, setEditorID] = useState<string>('wysiwyg-editor');

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
    let elementToRemove = imageToDelete;
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
        selectImage(img);
      } else {
        // 같은 이미지를 다시 클릭하면 편집창 토글
        setIsImageEditPopupOpen(!isImageEditPopupOpen);
      }
      return;
    }

    // 기존 선택된 이미지가 있으면 선택 해제
    // image-wrapper 또는 리사이즈 핸들이 아닌 경우
    if (selectedImage && !target.closest('.image-wrapper')) {
      deselectImage();
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
        } catch (e) {
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

  // YouTube 삽입
  const insertYoutube = () => {
    if (!youtubeUrl) return;

    const videoId = extractYoutubeVideoId(youtubeUrl);
    if (!videoId) {
      alert('올바른 유튜브 URL을 입력해주세요.\n\n지원 형식:\n• https://www.youtube.com/watch?v=VIDEO_ID\n• https://youtu.be/VIDEO_ID');
      return;
    }

    // YouTube iframe 컨테이너 생성
    const container = document.createElement('div');
    container.style.textAlign = 'center';
    container.style.margin = '20px 0';

    // iframe 생성
    const iframe = document.createElement('iframe');
    iframe.width = '560';
    iframe.height = '315';
    iframe.src = `https://www.youtube.com/embed/${videoId}`;
    iframe.title = 'YouTube video player';
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    iframe.style.maxWidth = '100%';
    iframe.style.height = 'auto';
    iframe.style.aspectRatio = '16 / 9';

    container.appendChild(iframe);

    // 에디터에 포커스 설정
    if (editorRef.current) {
      editorRef.current.focus();

      const selection = window.getSelection();

      // 저장된 선택 영역이 있으면 복원
      if (savedYoutubeSelection && selection) {
        try {
          selection.removeAllRanges();
          selection.addRange(savedYoutubeSelection);
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
        range.insertNode(container);

        // iframe 다음에 새 문단 추가
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
    setIsYoutubeDropdownOpen(false);
    setYoutubeUrl('');
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
    setEditorID(`wysiwyg-${uuid()}`);
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
    if (!isResizing || !resizeStartData || !selectedImage) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!selectedImage || !resizeStartData) return;

      const deltaX = e.clientX - resizeStartData.startX;
      const deltaY = e.clientY - resizeStartData.startY;
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
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeStartData(null);
      if (selectedImage) {
        setEditImageWidth(selectedImage.style.width);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeStartData, selectedImage]);

  // 스크롤 및 이미지 드래그 시 편집창 숨기기
  useEffect(() => {
    if (!selectedImage) return;

    // 스크롤 이벤트 핸들러
    const handleScroll = () => {
      if (isImageEditPopupOpen) {
        setIsImageEditPopupOpen(false);
      }
    };

    // 드래그 시작 이벤트 핸들러
    const handleDragStart = (e: DragEvent) => {
      if (e.target === selectedImage) {
        setIsImageEditPopupOpen(false);
      }
    };

    // 드래그 종료 이벤트 핸들러 - 이미지 이동 후 wrapper 재적용
    const handleDragEnd = (e: DragEvent) => {
      if (e.target === selectedImage) {
        // 드래그 후에도 선택 상태 유지를 원한다면 여기서 재선택
        // 아니면 선택 해제
        deselectImage();
      }
    };

    // 이벤트 리스너 등록
    window.addEventListener('scroll', handleScroll, true);
    editorRef.current?.addEventListener('scroll', handleScroll);
    selectedImage.addEventListener('dragstart', handleDragStart);
    selectedImage.addEventListener('dragend', handleDragEnd);

    // 이미지에 draggable 속성 추가
    selectedImage.draggable = true;

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      editorRef.current?.removeEventListener('scroll', handleScroll);
      if (selectedImage) {
        selectedImage.removeEventListener('dragstart', handleDragStart);
        selectedImage.removeEventListener('dragend', handleDragEnd);
        selectedImage.draggable = false;
      }
    };
  }, [selectedImage, isImageEditPopupOpen]);

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
    <div className={`${styles.wysiwyg} ${statusClass}`} style={{ width, position: 'relative' }}>
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
                    onClick={applyLink}
                    disabled={!linkUrl}
                  >
                    적용
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLinkDropdownOpen(false);
                      setLinkUrl('');
                      setLinkTarget('_blank');
                      setSavedSelection(null);
                    }}
                  >
                    취소
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
                    onClick={insertImage}
                    disabled={!imageUrl && !imageFile}
                  >
                    삽입
                  </button>
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
                  >
                    취소
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
                className={styles.youtubeDropdown}
                style={{
                  top: youtubeButtonRef.current?.getBoundingClientRect().bottom ?? 0,
                  left: youtubeButtonRef.current?.getBoundingClientRect().left ?? 0
                }}
              >
                <div className={styles.youtubeContent}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '600' }}>유튜브 삽입</h3>
                  <div className={styles.youtubeInput}>
                    <label>유튜브 URL</label>
                    <input
                      type="text"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=... 또는 https://youtu.be/..."
                      autoFocus
                    />
                  </div>
                  <div className={styles.youtubeHelp}>
                    <p style={{ fontSize: '12px', color: '#666', margin: '10px 0' }}>
                      유튜브 비디오 링크를 입력하세요. 지원되는 형식:
                      <br />• https://www.youtube.com/watch?v=VIDEO_ID
                      <br />• https://youtu.be/VIDEO_ID
                      <br />• https://www.youtube.com/embed/VIDEO_ID
                    </p>
                  </div>
                </div>

                <div className={styles.youtubeActions}>
                  <button
                    type="button"
                    onClick={() => insertYoutube()}
                    disabled={!youtubeUrl}
                  >
                    삽입
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsYoutubeDropdownOpen(false);
                      setYoutubeUrl('');
                      setSavedYoutubeSelection(null);
                    }}
                  >
                    취소
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
      </div>

      <div
        ref={editorRef}
        id={editorID}
        className={styles.editor}
        contentEditable
        onInput={handleInput}
        onClick={handleEditorClick}
        onKeyUp={() => {
          detectCurrentParagraphStyle();
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
                onClick={updateLink}
                disabled={!editLinkUrl}
              >
                수정
              </button>
              <button
                type="button"
                onClick={removeLink}
              >
                링크 삭제
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditLinkPopupOpen(false);
                  setSelectedLinkElement(null);
                  setEditLinkUrl('');
                  setEditLinkTarget('_self');
                }}
              >
                취소
              </button>
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
              onClick={applyImageEdit}
            >
              적용
            </button>
            <button
              type="button"
              onClick={deleteImage}
              style={{
                backgroundColor: '#ff4444',
                color: 'white',
                borderColor: '#ff4444'
              }}
            >
              삭제
            </button>
            <button
              type="button"
              onClick={deselectImage}
            >
              취소
            </button>
          </div>
        </div>
      )})()}
    </div>
  );
};

export default Wysiwyg;
