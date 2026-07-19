import type { Directive } from 'vue';

interface ShortcutBinding {
  key: string; // contoh: 'k': 'Escape'
  ctrl?: boolean;
  handler: () => void;
}

const handlerMap = new WeakMap<HTMLElement, (e: KeyboardEvent) => void>();

export const vShortcut: Directive<HTMLElement, ShortcutBinding | ShortcutBinding[]> = {
  mounted(el, binding) {
    const shortcuts = Array.isArray(binding.value) ? binding.value : [binding.value];

    const listener = (e: KeyboardEvent) => {
      for (const { key, ctrl = false, handler } of shortcuts) {
        const ctrlMatch = ctrl ? (e.ctrlKey || e.metaKey) : true;
        if (e.key.toLowerCase() === key.toLowerCase() && ctrlMatch) {
          e.preventDefault();
          handler();
          break;
        }
      }
    }

    handlerMap.set(el, listener);
    window.addEventListener('keydown', listener);
  },
  unmounted(el) {
    const listener = handlerMap.get(el);
    if (listener) {
      window.removeEventListener('keydown', listener);
      handlerMap.delete(el);
    }
  },
}