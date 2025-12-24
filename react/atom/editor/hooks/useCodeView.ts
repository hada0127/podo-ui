import { useState, RefObject } from 'react';

export interface UseCodeViewProps {
  editorRef: RefObject<HTMLDivElement>;
  codeEditorRef: RefObject<HTMLTextAreaElement>;
  value: string;
  onChange: (content: string) => void;
  formatHtml: (html: string) => string;
  getCleanHTML: (html: string) => string;
  height?: string | 'contents';
  onInput?: () => void; // handleInput 콜백
  onBeforeToggle?: (toCodeView: boolean) => void; // 토글 전 콜백 (예: clearCellSelection)
}

export interface UseCodeViewReturn {
  isCodeView: boolean;
  codeContent: string;
  savedEditorHeight: number | null;
  toggleCodeView: () => void;
  handleCodeChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

/**
 * 에디터 코드 보기 모드 관리 Hook
 *
 * 일반 WYSIWYG 모드와 HTML 코드 보기 모드 간 전환을 관리합니다.
 * 코드 보기 모드에서는 HTML을 포맷팅하여 표시하고, 사용자가 직접 수정할 수 있습니다.
 *
 * @param {UseCodeViewProps} props - Hook 설정
 * @returns {UseCodeViewReturn} 코드 보기 상태 및 관리 함수
 *
 * @example
 * ```tsx
 * const codeView = useCodeView({
 *   editorRef,
 *   codeEditorRef,
 *   value: content,
 *   onChange: setContent,
 *   formatHtml,
 *   getCleanHTML,
 *   height: '400px',
 *   onInput: handleInput,
 *   onBeforeToggle: (toCodeView) => {
 *     if (toCodeView) clearCellSelection();
 *   }
 * });
 *
 * // 코드 보기 전환
 * codeView.toggleCodeView();
 * ```
 */
export const useCodeView = ({
  editorRef,
  codeEditorRef,
  value,
  onChange,
  formatHtml,
  getCleanHTML,
  height,
  onInput,
  onBeforeToggle,
}: UseCodeViewProps): UseCodeViewReturn => {
  const [isCodeView, setIsCodeView] = useState(false);
  const [codeContent, setCodeContent] = useState('');
  const [originalHtml, setOriginalHtml] = useState('');
  const [savedEditorHeight, setSavedEditorHeight] = useState<number | null>(null);

  /**
   * 코드 보기 모드 전환
   */
  const toggleCodeView = () => {
    // 토글 전 콜백 실행 (예: clearCellSelection)
    if (onBeforeToggle) {
      onBeforeToggle(!isCodeView);
    }

    if (isCodeView) {
      // 코드보기에서 일반 모드로 전환
      setIsCodeView(false);
      setSavedEditorHeight(null); // 저장된 높이 초기화

      // 다음 렌더링 사이클에서 에디터 내용 업데이트
      setTimeout(() => {
        if (editorRef.current && originalHtml !== undefined) {
          // 원본 HTML을 사용 (포맷팅되지 않은 버전)
          editorRef.current.innerHTML = originalHtml;

          // handleInput 콜백 호출
          if (onInput) {
            onInput();
          }
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

        // 원본 HTML 저장 (포맷팅 없음)
        const html = editorRef.current.innerHTML;
        setOriginalHtml(html);

        // 표시용으로 포맷팅된 HTML 생성
        const formattedHtml = formatHtml(html);
        setCodeContent(formattedHtml);
        setIsCodeView(true);
      }
    }
  };

  /**
   * 코드 에디터 내용 변경 처리
   * @param {React.ChangeEvent<HTMLTextAreaElement>} e - 변경 이벤트
   */
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setCodeContent(newContent);
    // 사용자가 코드를 수정하면 원본 HTML도 업데이트
    setOriginalHtml(newContent);
  };

  return {
    isCodeView,
    codeContent,
    savedEditorHeight,
    toggleCodeView,
    handleCodeChange,
  };
};
