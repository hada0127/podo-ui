import { z } from 'zod';

export type ToolbarItem =
  | 'undo-redo'      // 실행 취소/다시 실행
  | 'paragraph'      // 문단 형식
  | 'text-style'     // 굵게, 기울임, 밑줄, 취소선
  | 'color'          // 글꼴 색상, 배경 색상
  | 'align'          // 정렬
  | 'list'           // 목록, 번호 목록
  | 'table'          // 표
  | 'link'           // 링크
  | 'image'          // 이미지
  | 'youtube'        // 유튜브
  | 'hr'             // 구분선
  | 'format'         // 서식 지우기
  | 'code';          // 코드 보기

export interface EditorProps {
  value: string;
  width?: string;
  height?: string | 'contents';
  minHeight?: string;
  maxHeight?: string;
  resizable?: boolean;
  onChange: (content: string) => void;
  validator?: z.ZodType<unknown>;
  placeholder?: string;
  toolbar?: ToolbarItem[]; // 사용할 툴바 아이템 (없으면 전부)
}

export interface ParagraphOption {
  value: string;
  label: string;
  className?: string;
}

export interface AlignOption {
  value: string;
  label: string;
  icon: string;
}
