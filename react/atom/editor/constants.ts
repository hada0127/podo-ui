import type { ParagraphOption, AlignOption, ToolbarItem } from './types';

/**
 * 색상 팔레트 (11x6 색상 배열)
 */
export const colorPalette: string[][] = [
  // 첫 번째 줄: 순수 색상 + 흰색/검은색
  ['#ff0000', '#ff8000', '#ffff00', '#80ff00', '#00ffff', '#0080ff', '#0000ff', '#8000ff', '#ff00ff', '#ffffff', '#000000'],
  // 두 번째 줄: 매우 밝은 톤 (90% 밝기)
  ['#ffcccc', '#ffe0cc', '#ffffcc', '#e0ffcc', '#ccffff', '#cce0ff', '#ccccff', '#e0ccff', '#ffccff', '#f5f5f5', '#cccccc'],
  // 세 번째 줄: 밝은 톤 (70% 밝기)
  ['#ff9999', '#ffcc99', '#ffff99', '#ccff99', '#99ffff', '#99ccff', '#9999ff', '#cc99ff', '#ff99ff', '#e6e6e6', '#999999'],
  // 네 번째 줄: 중간 톤 (50% 밝기)
  ['#ff6666', '#ffb366', '#ffff66', '#b3ff66', '#66ffff', '#66b3ff', '#6666ff', '#b366ff', '#ff66ff', '#d9d9d9', '#666666'],
  // 다섯 번째 줄: 어두운 톤 (30% 밝기)
  ['#cc0000', '#cc6600', '#cccc00', '#66cc00', '#00cccc', '#0066cc', '#0000cc', '#6600cc', '#cc00cc', '#b3b3b3', '#333333'],
  // 여섯 번째 줄: 매우 어두운 톤 (15% 밝기)
  ['#800000', '#804000', '#808000', '#408000', '#008080', '#004080', '#000080', '#400080', '#800080', '#808080', '#1a1a1a'],
];

/**
 * 정렬 옵션
 */
export const alignOptions: AlignOption[] = [
  { value: 'left', label: '왼쪽 정렬', icon: 'alignLeft' },
  { value: 'center', label: '가운데 정렬', icon: 'alignCenter' },
  { value: 'right', label: '오른쪽 정렬', icon: 'alignRight' },
];

/**
 * 문단 형식 옵션 (className은 메인 컴포넌트에서 styles를 통해 주입)
 */
export const paragraphOptions: ParagraphOption[] = [
  { value: 'h1', label: '제목 1' },
  { value: 'h2', label: '제목 2' },
  { value: 'h3', label: '제목 3' },
  { value: 'p', label: '본문' },
  { value: 'p1', label: 'P1' },
  { value: 'p2', label: 'P2' },
  { value: 'p3', label: 'P3' },
  { value: 'p3_semibold', label: 'P3 Semibold' },
  { value: 'p4', label: 'P4' },
  { value: 'p4_semibold', label: 'P4 Semibold' },
  { value: 'p5', label: 'P5' },
  { value: 'p5_semibold', label: 'P5 Semibold' },
];

/**
 * 기본 툴바 아이템 (모든 기능 활성화)
 */
export const defaultToolbar: ToolbarItem[] = [
  'undo-redo',
  'paragraph',
  'text-style',
  'color',
  'align',
  'list',
  'table',
  'link',
  'image',
  'youtube',
  'hr',
  'format',
  'code',
];
