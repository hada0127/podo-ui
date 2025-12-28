/**
 * Editor Constants
 *
 * Editor에서 사용하는 상수들을 정의합니다.
 */

import type { ToolbarItem } from '../../../atom/Editor.svelte';
import styles from '../../../../react/atom/editor.module.scss';

/**
 * 기본 툴바 항목 배열
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

/**
 * 색상 팔레트 (6행 x 11열)
 */
export const colorPalette: string[][] = [
  ['#ff0000', '#ff8000', '#ffff00', '#80ff00', '#00ffff', '#0080ff', '#0000ff', '#8000ff', '#ff00ff', '#ffffff', '#000000'],
  ['#ffcccc', '#ffe0cc', '#ffffcc', '#e0ffcc', '#ccffff', '#cce0ff', '#ccccff', '#e0ccff', '#ffccff', '#f5f5f5', '#cccccc'],
  ['#ff9999', '#ffcc99', '#ffff99', '#ccff99', '#99ffff', '#99ccff', '#9999ff', '#cc99ff', '#ff99ff', '#e6e6e6', '#999999'],
  ['#ff6666', '#ffb366', '#ffff66', '#b3ff66', '#66ffff', '#66b3ff', '#6666ff', '#b366ff', '#ff66ff', '#d9d9d9', '#666666'],
  ['#cc0000', '#cc6600', '#cccc00', '#66cc00', '#00cccc', '#0066cc', '#0000cc', '#6600cc', '#cc00cc', '#b3b3b3', '#333333'],
  ['#800000', '#804000', '#808000', '#408000', '#008080', '#004080', '#000080', '#400080', '#800080', '#808080', '#1a1a1a'],
];

/**
 * 정렬 옵션
 */
export interface AlignOption {
  value: 'left' | 'center' | 'right';
  label: string;
  icon: string;
}

export const alignOptions: AlignOption[] = [
  { value: 'left', label: '왼쪽 정렬', icon: 'alignLeft' },
  { value: 'center', label: '가운데 정렬', icon: 'alignCenter' },
  { value: 'right', label: '오른쪽 정렬', icon: 'alignRight' },
];

/**
 * 문단 옵션
 */
export interface ParagraphOption {
  value: string;
  label: string;
  className?: string;
}

export const paragraphOptions: ParagraphOption[] = [
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
];
