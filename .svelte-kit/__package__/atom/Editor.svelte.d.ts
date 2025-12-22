import type { z } from 'zod';
export type ToolbarItem = 'undo-redo' | 'paragraph' | 'text-style' | 'color' | 'align' | 'list' | 'table' | 'link' | 'image' | 'youtube' | 'hr' | 'format' | 'code';
interface Props {
    /** HTML content */
    value?: string;
    /** Editor width */
    width?: string;
    /** Editor height */
    height?: string | 'contents';
    /** Minimum height */
    minHeight?: string;
    /** Maximum height */
    maxHeight?: string;
    /** Allow resizing */
    resizable?: boolean;
    /** Change handler */
    onchange?: (content: string) => void;
    /** Zod validator */
    validator?: z.ZodType<unknown>;
    /** Placeholder text */
    placeholder?: string;
    /** Toolbar items to show */
    toolbar?: ToolbarItem[];
    /** Additional class name */
    class?: string;
}
type $$ComponentProps = Props & Record<string, unknown>;
declare const Editor: import("svelte").Component<$$ComponentProps, {}, "value">;
type Editor = ReturnType<typeof Editor>;
export default Editor;
