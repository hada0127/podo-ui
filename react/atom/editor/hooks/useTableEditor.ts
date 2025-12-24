import { useState, useCallback, useEffect, useRef, RefObject } from 'react';
import { UseSelectionManagerReturn } from './useSelectionManager';

export interface UseTableEditorProps {
  editorRef: RefObject<HTMLDivElement>;
  selectionManager: UseSelectionManagerReturn;
  onInput?: () => void;
  onOtherDropdownsClose?: () => void; // 다른 드롭다운 닫기 콜백
  tableContextMenuRef: RefObject<HTMLDivElement>;
}

export interface UseTableEditorReturn {
  // 표 삽입 드롭다운 상태
  isTableDropdownOpen: boolean;
  tableRows: number;
  tableCols: number;

  // 표 셀 선택 상태
  selectedTableCell: HTMLTableCellElement | null;
  selectedTableCells: HTMLTableCellElement[];

  // 컨텍스트 메뉴 상태
  isTableContextMenuOpen: boolean;
  tableContextMenuPosition: { x: number; y: number };
  isTableCellColorOpen: boolean;

  // Ref
  isSelectingCellsRef: RefObject<boolean>;
  justFinishedDraggingRef: RefObject<boolean>;

  // Setter
  setIsTableDropdownOpen: (open: boolean) => void;
  setTableRows: (rows: number) => void;
  setTableCols: (cols: number) => void;
  setIsTableContextMenuOpen: (open: boolean) => void;
  setIsTableCellColorOpen: (open: boolean) => void;
  setSelectedTableCell: (cell: HTMLTableCellElement | null) => void;

  // 함수
  openTableDropdown: () => void;
  insertTable: (rows: number, cols: number) => void;
  handleEditorContextMenu: (e: React.MouseEvent<HTMLDivElement>) => void;
  clearCellSelection: () => void;
  changeTableCellBackgroundColor: (color: string) => void;
  resetTableCellBackgroundColor: () => void;
  changeTableCellAlign: (align: 'left' | 'center' | 'right') => void;
  addTableRow: (position: 'above' | 'below') => void;
  deleteTableRow: () => void;
  addTableColumn: (position: 'left' | 'right') => void;
  deleteTableColumn: () => void;
  deleteTable: () => void;
  closeTableContextMenu: () => void;
}

/**
 * 에디터 표 관리 Hook
 *
 * 표 삽입, 셀 드래그 선택, 행/열 추가/삭제, 셀 배경색 변경 기능을 제공합니다.
 *
 * @param {UseTableEditorProps} props - Hook 설정
 * @returns {UseTableEditorReturn} 표 관리 상태 및 함수
 *
 * @example
 * ```tsx
 * const tableEditor = useTableEditor({
 *   editorRef,
 *   selectionManager,
 *   onInput: handleInput,
 *   onOtherDropdownsClose: () => {
 *     setIsImageDropdownOpen(false);
 *   },
 *   tableContextMenuRef
 * });
 *
 * // 표 삽입
 * tableEditor.insertTable(3, 4);
 *
 * // 행 추가
 * tableEditor.addTableRow('below');
 * ```
 */
export const useTableEditor = ({
  editorRef,
  selectionManager,
  onInput,
  onOtherDropdownsClose,
  tableContextMenuRef,
}: UseTableEditorProps): UseTableEditorReturn => {
  // 표 삽입 드롭다운 상태
  const [isTableDropdownOpen, setIsTableDropdownOpen] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [savedTableSelection, setSavedTableSelection] = useState<Range | null>(null);

  // 표 셀 선택 상태
  const [selectedTableCell, setSelectedTableCell] = useState<HTMLTableCellElement | null>(null);
  const [selectedTableCells, setSelectedTableCells] = useState<HTMLTableCellElement[]>([]);
  const [selectionStartCell, setSelectionStartCell] = useState<HTMLTableCellElement | null>(null);

  // 컨텍스트 메뉴 상태
  const [isTableContextMenuOpen, setIsTableContextMenuOpen] = useState(false);
  const [tableContextMenuPosition, setTableContextMenuPosition] = useState({ x: 0, y: 0 });
  const [isTableCellColorOpen, setIsTableCellColorOpen] = useState(false);

  // 내부 Ref
  const isSelectingCellsRef = useRef(false); // 셀 드래그 중인지 추적
  const justFinishedDraggingRef = useRef(false); // 드래그가 방금 끝났는지 추적
  const isMouseDownRef = useRef(false); // 마우스 버튼이 눌려있는지 추적

  /**
   * 표 드롭다운 열기
   */
  const openTableDropdown = useCallback(() => {
    // 현재 선택 영역 저장
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      setSavedTableSelection(selection.getRangeAt(0).cloneRange());
    }

    setIsTableDropdownOpen(true);

    // 다른 드롭다운 닫기
    if (onOtherDropdownsClose) {
      onOtherDropdownsClose();
    }
  }, [onOtherDropdownsClose]);

  /**
   * 표 삽입
   */
  const insertTable = useCallback((rows: number, cols: number) => {
    if (rows === 0 || cols === 0) return;

    // 표 HTML 생성
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

    // 에디터에 포커스 설정
    if (editorRef.current) {
      editorRef.current.focus();

      const selection = window.getSelection();

      // 저장된 선택 영역이 있으면 복원
      if (savedTableSelection && selection) {
        try {
          selection.removeAllRanges();
          selection.addRange(savedTableSelection);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

      // 표 삽입
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(table);

        // 표 다음에 새 문단 추가
        const newP = document.createElement('p');
        newP.innerHTML = '<br>';
        table.after(newP);

        // 커서를 첫 번째 셀로 이동
        const firstCell = table.querySelector('td');
        if (firstCell) {
          const newRange = document.createRange();
          newRange.selectNodeContents(firstCell);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      } else {
        // 폴백: 에디터 끝에 추가
        editorRef.current.appendChild(table);
      }
    }

    // 상태 초기화
    setIsTableDropdownOpen(false);
    setTableRows(3);
    setTableCols(3);
    setSavedTableSelection(null);

    editorRef.current?.focus();
    if (onInput) {
      onInput();
    }
  }, [editorRef, savedTableSelection, onInput]);

  /**
   * 다중 셀 선택 범위 계산
   */
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

  /**
   * 셀 선택 해제
   */
  const clearCellSelection = useCallback(() => {
    selectedTableCells.forEach(cell => cell.classList.remove('selected-cell'));
    setSelectedTableCells([]);
    setSelectionStartCell(null);
  }, [selectedTableCells]);

  /**
   * 표 셀 마우스 다운 (드래그 선택 시작)
   */
  const handleCellMouseDown = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const cell = target.closest('td') as HTMLTableCellElement;

    if (cell && editorRef.current?.contains(cell)) {
      // 이미지나 이미지 컨테이너를 드래그하는 경우 셀 선택 방지
      if (target.tagName === 'IMG' || target.classList.contains('image-container')) {
        return;
      }

      // 마우스 다운 상태 설정
      isMouseDownRef.current = true;

      // 드래그 시작 셀 설정
      setSelectionStartCell(cell);

      // 이미 선택된 셀을 클릭한 경우 선택 유지
      const isAlreadySelected = cell.classList.contains('selected-cell');

      // 새로운 셀을 클릭하거나 Shift 키를 누르지 않은 경우에만 기존 선택 해제
      if (!isAlreadySelected && !e.shiftKey) {
        const allCells = editorRef.current.querySelectorAll('.selected-cell');
        allCells.forEach(c => c.classList.remove('selected-cell'));
        setSelectedTableCells([]);
      }
    }
  }, [editorRef]);

  /**
   * 표 셀 마우스 이동 (드래그 선택 진행)
   */
  const handleCellMouseMove = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const cell = target.closest('td') as HTMLTableCellElement;

    if (!cell || !editorRef.current?.contains(cell)) return;

    // 마우스가 눌려있지 않으면 드래그 불가
    if (!isMouseDownRef.current) {
      return;
    }

    // selectionStartCell이 있고, 다른 셀로 이동한 경우에만 드래그 선택 모드 활성화
    if (selectionStartCell && cell !== selectionStartCell && !isSelectingCellsRef.current) {
      isSelectingCellsRef.current = true;
      e.preventDefault();
      e.stopPropagation();
    }

    if (!isSelectingCellsRef.current || !selectionStartCell) return;

    e.preventDefault();
    e.stopPropagation();

    // 범위 내 모든 셀 선택
    const cellsInRange = getCellsInRange(selectionStartCell, cell);

    // 기존 선택 클래스 제거
    const allSelectedCells = editorRef.current.querySelectorAll('.selected-cell');
    allSelectedCells.forEach(c => c.classList.remove('selected-cell'));

    // 새 선택 적용
    setSelectedTableCells(cellsInRange);
    cellsInRange.forEach(c => c.classList.add('selected-cell'));
  }, [selectionStartCell]);

  /**
   * 표 셀 마우스 업 (드래그 선택 종료)
   */
  const handleCellMouseUp = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const cell = target.closest('td') as HTMLTableCellElement;

    // 드래그 선택 중이었다면 플래그 설정
    if (isSelectingCellsRef.current) {
      // 셀 내부에서 마우스 업한 경우 이벤트 방지
      if (cell && editorRef.current?.contains(cell)) {
        e.preventDefault();
        e.stopPropagation();
      }

      // 드래그가 방금 끝났음을 표시
      justFinishedDraggingRef.current = true;

      // 50ms 후 플래그 해제 (클릭 이벤트가 처리된 후)
      setTimeout(() => {
        justFinishedDraggingRef.current = false;
      }, 50);
    }

    // 마우스 다운 상태 해제 (가장 중요!)
    isMouseDownRef.current = false;

    // 드래그 선택 모드 무조건 종료 (선택된 셀은 유지)
    isSelectingCellsRef.current = false;
    // selectionStartCell은 유지하여 선택 상태 보존
  }, [editorRef]);

  /**
   * 표 셀 우클릭 이벤트 처리
   */
  const handleEditorContextMenu = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    // 표 셀 우클릭 감지 (td 또는 td 내부 요소)
    const cell = target.closest('td') as HTMLTableCellElement;
    if (cell && editorRef.current?.contains(cell)) {
      e.preventDefault();
      e.stopPropagation();

      // 선택된 셀이 없거나, 우클릭한 셀이 선택 영역에 포함되지 않은 경우
      if (selectedTableCells.length === 0 || !selectedTableCells.includes(cell)) {
        clearCellSelection();
        setSelectedTableCell(cell);
      } else {
        // 선택된 셀들 중 하나를 우클릭한 경우, 첫 번째 셀을 대표로 사용
        setSelectedTableCell(selectedTableCells[0]);
      }

      setTableContextMenuPosition({ x: e.clientX, y: e.clientY });
      setIsTableContextMenuOpen(true);
      setIsTableCellColorOpen(false);
    }
  }, [selectedTableCells, editorRef, clearCellSelection]);

  /**
   * 셀 배경색 변경 (단일/다중)
   */
  const changeTableCellBackgroundColor = useCallback((color: string) => {
    // 다중 셀이 선택되어 있으면 모든 선택된 셀에 적용
    if (selectedTableCells.length > 0) {
      selectedTableCells.forEach(cell => {
        cell.style.backgroundColor = color;
      });
    } else if (selectedTableCell) {
      // 단일 셀에만 적용
      selectedTableCell.style.backgroundColor = color;
    }

    setIsTableCellColorOpen(false);

    if (onInput) {
      onInput();
    }
  }, [selectedTableCells, selectedTableCell, onInput]);

  /**
   * 셀 배경색 초기화
   */
  const resetTableCellBackgroundColor = useCallback(() => {
    if (selectedTableCells.length > 0) {
      selectedTableCells.forEach(cell => {
        cell.style.backgroundColor = '';
      });
    } else if (selectedTableCell) {
      selectedTableCell.style.backgroundColor = '';
    }

    setIsTableCellColorOpen(false);

    if (onInput) {
      onInput();
    }
  }, [selectedTableCells, selectedTableCell, onInput]);

  /**
   * 셀 정렬 설정
   */
  const changeTableCellAlign = useCallback((align: 'left' | 'center' | 'right') => {
    if (selectedTableCells.length > 0) {
      selectedTableCells.forEach(cell => {
        cell.style.textAlign = align;
      });
    } else if (selectedTableCell) {
      selectedTableCell.style.textAlign = align;
    }

    if (onInput) {
      onInput();
    }
  }, [selectedTableCells, selectedTableCell, onInput]);

  /**
   * 행 추가 (위/아래)
   */
  const addTableRow = useCallback((position: 'above' | 'below') => {
    if (!selectedTableCell) return;

    const row = selectedTableCell.closest('tr');
    if (!row) return;

    const table = row.closest('table');
    if (!table) return;

    const newRow = document.createElement('tr');
    const cellCount = row.cells.length;

    for (let i = 0; i < cellCount; i++) {
      const td = document.createElement('td');
      td.style.border = '1px solid #ddd';
      td.style.padding = '8px';
      td.style.minWidth = '50px';
      td.innerHTML = '<br>';
      newRow.appendChild(td);
    }

    if (position === 'above') {
      row.parentNode?.insertBefore(newRow, row);
    } else {
      row.parentNode?.insertBefore(newRow, row.nextSibling);
    }

    setIsTableContextMenuOpen(false);

    if (onInput) {
      onInput();
    }
  }, [selectedTableCell, onInput]);

  /**
   * 행 삭제
   */
  const deleteTableRow = useCallback(() => {
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
    setIsTableContextMenuOpen(false);
    setSelectedTableCell(null);

    if (onInput) {
      onInput();
    }
  }, [selectedTableCell, onInput]);

  /**
   * 열 추가 (좌/우)
   */
  const addTableColumn = useCallback((position: 'left' | 'right') => {
    if (!selectedTableCell) return;

    const cellIndex = selectedTableCell.cellIndex;
    const row = selectedTableCell.closest('tr');
    if (!row) return;

    const table = row.closest('table');
    if (!table) return;

    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    Array.from(tbody.rows).forEach(row => {
      const newCell = document.createElement('td');
      newCell.style.border = '1px solid #ddd';
      newCell.style.padding = '8px';
      newCell.style.minWidth = '50px';
      newCell.innerHTML = '<br>';

      if (position === 'left') {
        row.insertBefore(newCell, row.cells[cellIndex]);
      } else {
        if (cellIndex + 1 < row.cells.length) {
          row.insertBefore(newCell, row.cells[cellIndex + 1]);
        } else {
          row.appendChild(newCell);
        }
      }
    });

    setIsTableContextMenuOpen(false);

    if (onInput) {
      onInput();
    }
  }, [selectedTableCell, onInput]);

  /**
   * 열 삭제
   */
  const deleteTableColumn = useCallback(() => {
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

    Array.from(tbody.rows).forEach(row => {
      if (row.cells[cellIndex]) {
        row.cells[cellIndex].remove();
      }
    });

    setIsTableContextMenuOpen(false);
    setSelectedTableCell(null);

    if (onInput) {
      onInput();
    }
  }, [selectedTableCell, onInput]);

  /**
   * 표 삭제
   */
  const deleteTable = useCallback(() => {
    if (!selectedTableCell) return;

    const table = selectedTableCell.closest('table');
    if (!table) return;

    table.remove();
    setIsTableContextMenuOpen(false);
    setSelectedTableCell(null);
    clearCellSelection();

    editorRef.current?.focus();

    if (onInput) {
      onInput();
    }
  }, [selectedTableCell, editorRef, clearCellSelection, onInput]);

  /**
   * 컨텍스트 메뉴 닫기
   */
  const closeTableContextMenu = useCallback(() => {
    setIsTableContextMenuOpen(false);
    setIsTableCellColorOpen(false);
  }, []);

  /**
   * 셀 드래그 이벤트 리스너 등록
   */
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.addEventListener('mousedown', handleCellMouseDown);
    document.addEventListener('mousemove', handleCellMouseMove);
    document.addEventListener('mouseup', handleCellMouseUp);

    return () => {
      editor.removeEventListener('mousedown', handleCellMouseDown);
      document.removeEventListener('mousemove', handleCellMouseMove);
      document.removeEventListener('mouseup', handleCellMouseUp);
    };
  }, [editorRef, handleCellMouseDown, handleCellMouseMove, handleCellMouseUp]);

  /**
   * 컨텍스트 메뉴 외부 클릭 감지
   */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isTableContextMenuOpen && tableContextMenuRef.current && !tableContextMenuRef.current.contains(e.target as Node)) {
        closeTableContextMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTableContextMenuOpen, tableContextMenuRef, closeTableContextMenu]);

  /**
   * 에디터 클릭 시 셀 선택 해제
   */
  useEffect(() => {
    const handleEditorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // 드래그가 방금 끝난 경우 무시
      if (justFinishedDraggingRef.current) {
        return;
      }

      // 표 셀 외부를 클릭한 경우에만 선택 해제
      const clickedCell = target.closest('td') as HTMLTableCellElement;
      if (!clickedCell && selectedTableCells.length > 0) {
        clearCellSelection();
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
  }, [editorRef, selectedTableCells, clearCellSelection]);

  return {
    // 표 삽입 드롭다운 상태
    isTableDropdownOpen,
    tableRows,
    tableCols,

    // 표 셀 선택 상태
    selectedTableCell,
    selectedTableCells,

    // 컨텍스트 메뉴 상태
    isTableContextMenuOpen,
    tableContextMenuPosition,
    isTableCellColorOpen,

    // Ref
    isSelectingCellsRef,
    justFinishedDraggingRef,

    // Setter
    setIsTableDropdownOpen,
    setTableRows,
    setTableCols,
    setIsTableContextMenuOpen,
    setIsTableCellColorOpen,
    setSelectedTableCell,

    // 함수
    openTableDropdown,
    insertTable,
    handleEditorContextMenu,
    clearCellSelection,
    changeTableCellBackgroundColor,
    resetTableCellBackgroundColor,
    changeTableCellAlign,
    addTableRow,
    deleteTableRow,
    addTableColumn,
    deleteTableColumn,
    deleteTable,
    closeTableContextMenu,
  };
};
