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
export function portal(
  node: HTMLElement,
  target: HTMLElement | string = 'body'
) {
  let targetEl: HTMLElement;

  function update(newTarget: HTMLElement | string) {
    target = newTarget;

    if (typeof target === 'string') {
      targetEl = document.querySelector(target) as HTMLElement;
      if (!targetEl) {
        throw new Error(`No element found matching "${target}"`);
      }
    } else {
      targetEl = target;
    }

    targetEl.appendChild(node);
    node.hidden = false;
  }

  function destroy() {
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }
  }

  update(target);

  return {
    update,
    destroy,
  };
}

export default portal;
