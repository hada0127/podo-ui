import { useState, useCallback, RefObject } from 'react';
import { UseSelectionManagerReturn } from './useSelectionManager';

export interface UseLinkEditorProps {
  editorRef: RefObject<HTMLDivElement>;
  selectionManager: UseSelectionManagerReturn;
  onInput?: () => void;
  onOtherDropdownsClose?: () => void; // 다른 드롭다운 닫기 콜백
}

export interface UseLinkEditorReturn {
  // 링크 삽입 드롭다운 상태
  isLinkDropdownOpen: boolean;
  linkUrl: string;
  linkTarget: string;

  // 링크 편집 팝업 상태
  isEditLinkPopupOpen: boolean;
  selectedLinkElement: HTMLAnchorElement | null;
  editLinkUrl: string;
  editLinkTarget: string;

  // Setter
  setIsLinkDropdownOpen: (open: boolean) => void;
  setLinkUrl: (url: string) => void;
  setLinkTarget: (target: string) => void;
  setIsEditLinkPopupOpen: (open: boolean) => void;
  setEditLinkUrl: (url: string) => void;
  setEditLinkTarget: (target: string) => void;

  // 함수
  openLinkDropdown: () => void;
  insertLink: () => void;
  handleLinkClick: (linkElement: HTMLAnchorElement) => void;
  editLink: () => void;
  deleteLink: () => void;
  closeEditLinkPopup: () => void;
}

/**
 * 에디터 링크 관리 Hook
 *
 * 링크 삽입, 편집, 삭제 기능을 제공합니다.
 * 텍스트 선택 후 링크를 추가하거나, 기존 링크를 클릭하여 수정할 수 있습니다.
 *
 * @param {UseLinkEditorProps} props - Hook 설정
 * @returns {UseLinkEditorReturn} 링크 관리 상태 및 함수
 *
 * @example
 * ```tsx
 * const linkEditor = useLinkEditor({
 *   editorRef,
 *   selectionManager,
 *   onInput: handleInput,
 *   onOtherDropdownsClose: () => {
 *     setIsParagraphDropdownOpen(false);
 *     setIsTextColorOpen(false);
 *   }
 * });
 *
 * // 링크 드롭다운 열기
 * linkEditor.openLinkDropdown();
 *
 * // 링크 삽입
 * linkEditor.setLinkUrl('https://example.com');
 * linkEditor.setLinkTarget('_blank');
 * linkEditor.insertLink();
 * ```
 */
export const useLinkEditor = ({
  editorRef,
  selectionManager,
  onInput,
  onOtherDropdownsClose,
}: UseLinkEditorProps): UseLinkEditorReturn => {
  // 링크 삽입 드롭다운 상태
  const [isLinkDropdownOpen, setIsLinkDropdownOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTarget, setLinkTarget] = useState('_blank');

  // 링크 편집 팝업 상태
  const [isEditLinkPopupOpen, setIsEditLinkPopupOpen] = useState(false);
  const [selectedLinkElement, setSelectedLinkElement] = useState<HTMLAnchorElement | null>(null);
  const [editLinkUrl, setEditLinkUrl] = useState('');
  const [editLinkTarget, setEditLinkTarget] = useState('_self');

  /**
   * 링크 드롭다운 열기
   */
  const openLinkDropdown = useCallback(() => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      // 선택 영역 저장
      selectionManager.saveSelection();
      setIsLinkDropdownOpen(true);

      // 다른 드롭다운 닫기
      if (onOtherDropdownsClose) {
        onOtherDropdownsClose();
      }
    }
  }, [selectionManager, onOtherDropdownsClose]);

  /**
   * 링크 삽입
   */
  const insertLink = useCallback(() => {
    if (linkUrl && selectionManager.selection) {
      selectionManager.restoreSelection(selectionManager.selection);

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

        editorRef.current?.focus();

        if (onInput) {
          onInput();
        }
      }
    }
  }, [linkUrl, linkTarget, selectionManager, editorRef, onInput]);

  /**
   * 링크 클릭 핸들러 (링크 편집 팝업 열기)
   */
  const handleLinkClick = useCallback((linkElement: HTMLAnchorElement) => {
    setSelectedLinkElement(linkElement);
    setEditLinkUrl(linkElement.href);
    setEditLinkTarget(linkElement.target || '_self');
    setIsEditLinkPopupOpen(true);
  }, []);

  /**
   * 링크 수정
   */
  const editLink = useCallback(() => {
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

      if (onInput) {
        onInput();
      }
    }
  }, [selectedLinkElement, editLinkUrl, editLinkTarget, editorRef, onInput]);

  /**
   * 링크 삭제
   */
  const deleteLink = useCallback(() => {
    if (selectedLinkElement) {
      const parent = selectedLinkElement.parentNode;
      const textContent = selectedLinkElement.textContent || '';
      const textNode = document.createTextNode(textContent);

      parent?.replaceChild(textNode, selectedLinkElement);

      setIsEditLinkPopupOpen(false);
      setSelectedLinkElement(null);
      editorRef.current?.focus();

      if (onInput) {
        onInput();
      }
    }
  }, [selectedLinkElement, editorRef, onInput]);

  /**
   * 링크 편집 팝업 닫기
   */
  const closeEditLinkPopup = useCallback(() => {
    setIsEditLinkPopupOpen(false);
    setSelectedLinkElement(null);
  }, []);

  return {
    // 링크 삽입 드롭다운 상태
    isLinkDropdownOpen,
    linkUrl,
    linkTarget,

    // 링크 편집 팝업 상태
    isEditLinkPopupOpen,
    selectedLinkElement,
    editLinkUrl,
    editLinkTarget,

    // Setter
    setIsLinkDropdownOpen,
    setLinkUrl,
    setLinkTarget,
    setIsEditLinkPopupOpen,
    setEditLinkUrl,
    setEditLinkTarget,

    // 함수
    openLinkDropdown,
    insertLink,
    handleLinkClick,
    editLink,
    deleteLink,
    closeEditLinkPopup,
  };
};
