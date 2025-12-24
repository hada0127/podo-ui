import { useState, useRef, useCallback, useEffect, RefObject } from 'react';

export interface UseEditorHistoryProps {
  editorRef: RefObject<HTMLDivElement>;
  onChange: (content: string) => void;
  getCleanHTML: (html: string) => string;
  initialValue: string;
  onStateChange?: () => void; // Undo/Redo 후 상태 변경 감지 콜백 (detectCurrentParagraphStyle 등)
}

export interface UseEditorHistoryReturn {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  addToHistory: (content: string) => void;
  isUndoRedoRef: RefObject<boolean>;
}

/**
 * 에디터 Undo/Redo 히스토리 관리 Hook
 *
 * 에디터의 변경 이력을 관리하고 Undo/Redo 기능을 제공합니다.
 * 연속된 입력은 500ms 디바운스를 적용하여 하나의 히스토리로 묶습니다.
 * 최대 200개의 히스토리를 저장합니다.
 *
 * @param {UseEditorHistoryProps} props - Hook 설정
 * @returns {UseEditorHistoryReturn} 히스토리 상태 및 관리 함수
 *
 * @example
 * ```tsx
 * const history = useEditorHistory({
 *   editorRef,
 *   onChange: (content) => setContent(content),
 *   getCleanHTML: (html) => cleanHTML(html),
 *   initialValue: '',
 *   onStateChange: () => {
 *     detectCurrentParagraphStyle();
 *     detectCurrentAlign();
 *   }
 * });
 *
 * // Undo 실행
 * history.undo();
 *
 * // Redo 실행
 * history.redo();
 *
 * // 히스토리 추가 (디바운스 적용)
 * history.addToHistory(newContent);
 * ```
 */
export const useEditorHistory = ({
  editorRef,
  onChange,
  getCleanHTML,
  initialValue,
  onStateChange,
}: UseEditorHistoryProps): UseEditorHistoryReturn => {
  const [history, setHistory] = useState<string[]>([initialValue]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const historyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const historyRef = useRef<string[]>([initialValue]);
  const historyIndexRef = useRef(0);
  const isUndoRedoRef = useRef(false); // undo/redo 실행 중 플래그

  // history와 historyIndex가 변경되면 ref도 업데이트
  useEffect(() => {
    historyRef.current = history;
    historyIndexRef.current = historyIndex;
  }, [history, historyIndex]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (historyTimerRef.current) {
        clearTimeout(historyTimerRef.current);
      }
    };
  }, []);

  /**
   * 히스토리에 추가 (500ms 디바운스 적용)
   * @param {string} content - 추가할 HTML 콘텐츠
   */
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

  /**
   * Undo 실행
   */
  const undo = useCallback(() => {
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
        onChange(getCleanHTML(content));

        // 상태 변경 콜백 호출 (detectCurrentParagraphStyle 등)
        if (onStateChange) {
          onStateChange();
        }

        // 다음 틱에서 플래그 해제
        setTimeout(() => {
          isUndoRedoRef.current = false;
        }, 0);
      }
    }
  }, [editorRef, onChange, getCleanHTML, onStateChange]);

  /**
   * Redo 실행
   */
  const redo = useCallback(() => {
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
        onChange(getCleanHTML(content));

        // 상태 변경 콜백 호출 (detectCurrentParagraphStyle 등)
        if (onStateChange) {
          onStateChange();
        }

        // 다음 틱에서 플래그 해제
        setTimeout(() => {
          isUndoRedoRef.current = false;
        }, 0);
      }
    }
  }, [editorRef, onChange, getCleanHTML, onStateChange]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return {
    canUndo,
    canRedo,
    undo,
    redo,
    addToHistory,
    isUndoRedoRef,
  };
};
