import { useState } from 'react';

export interface UseSelectionManagerReturn {
  selection: Range | null;
  saveSelection: () => Range | null;
  restoreSelection: (range?: Range | null) => boolean;
}

/**
 * 에디터 선택 영역 관리 Hook
 *
 * 텍스트 선택 영역을 저장하고 복원하는 기능을 제공합니다.
 * 링크/이미지/유튜브 삽입 시 선택 영역을 유지하기 위해 사용됩니다.
 *
 * @returns {UseSelectionManagerReturn} 선택 영역 상태 및 관리 함수
 *
 * @example
 * ```tsx
 * const selectionManager = useSelectionManager();
 *
 * // 선택 영역 저장
 * const range = selectionManager.saveSelection();
 *
 * // 나중에 복원
 * selectionManager.restoreSelection(range);
 * ```
 */
export const useSelectionManager = (): UseSelectionManagerReturn => {
  const [selection, setSelection] = useState<Range | null>(null);

  /**
   * 현재 선택 영역 저장
   * @returns {Range | null} 저장된 Range 객체 또는 null
   */
  const saveSelection = (): Range | null => {
    const windowSelection = window.getSelection();
    if (windowSelection && windowSelection.rangeCount > 0) {
      const range = windowSelection.getRangeAt(0);
      setSelection(range);
      return range;
    }
    setSelection(null);
    return null;
  };

  /**
   * 선택 영역 복원
   * @param {Range | null} range - 복원할 Range 객체 (미제공 시 저장된 selection 사용)
   * @returns {boolean} 복원 성공 여부
   */
  const restoreSelection = (range?: Range | null): boolean => {
    const targetRange = range !== undefined ? range : selection;

    if (targetRange) {
      const windowSelection = window.getSelection();
      if (windowSelection) {
        windowSelection.removeAllRanges();
        windowSelection.addRange(targetRange);
        return true;
      }
    }
    return false;
  };

  return {
    selection,
    saveSelection,
    restoreSelection,
  };
};
