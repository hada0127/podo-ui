/**
 * Svelte action to render element into a different part of the DOM
 * Similar to React's createPortal
 *
 * @param node - The node to portal
 * @param target - Target element or selector (default: 'body')
 * @returns Svelte action object with update and destroy methods
 *
 * @example
 * <div use:portal={'body'}>
 *   This will be rendered in body
 * </div>
 */
export declare function portal(node: HTMLElement, target?: HTMLElement | string): {
    update: (newTarget: HTMLElement | string) => void;
    destroy: () => void;
};
export default portal;
