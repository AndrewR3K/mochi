import type { InputWriter } from '@mochi-labs/core';

export function connectBrowserInput(
  element: HTMLElement,
  input: InputWriter,
): () => void {
  let pointerX = 0;
  let pointerY = 0;

  const onKeyDown = (event: KeyboardEvent) => {
    input.setKey(event.code, true);
  };

  const onKeyUp = (event: KeyboardEvent) => {
    input.setKey(event.code, false);
  };

  const onPointerMove = (event: PointerEvent) => {
    const rect = element.getBoundingClientRect();
    const locked = document.pointerLockElement === element;
    const x = locked ? pointerX + event.movementX : event.clientX - rect.left;
    const y = locked ? pointerY + event.movementY : event.clientY - rect.top;
    pointerX = x;
    pointerY = y;

    input.setPointerPosition(
      x,
      y,
      event.movementX,
      event.movementY,
    );
  };

  const onPointerDown = (event: PointerEvent) => {
    input.setPointerButton(event.button, true);
    element.setPointerCapture(event.pointerId);
    const rect = element.getBoundingClientRect();
    pointerX = event.clientX - rect.left;
    pointerY = event.clientY - rect.top;
    if (event.button === 2) {
      element.requestPointerLock?.();
    }
  };

  const onPointerUp = (event: PointerEvent) => {
    input.setPointerButton(event.button, false);
    element.releasePointerCapture(event.pointerId);
    if (event.button === 2 && document.pointerLockElement === element) {
      document.exitPointerLock?.();
    }
  };

  const onContextMenu = (event: MouseEvent) => {
    event.preventDefault();
  };

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  element.addEventListener('pointermove', onPointerMove);
  element.addEventListener('pointerdown', onPointerDown);
  element.addEventListener('pointerup', onPointerUp);
  element.addEventListener('pointercancel', onPointerUp);
  element.addEventListener('contextmenu', onContextMenu);

  return () => {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    element.removeEventListener('pointermove', onPointerMove);
    element.removeEventListener('pointerdown', onPointerDown);
    element.removeEventListener('pointerup', onPointerUp);
    element.removeEventListener('pointercancel', onPointerUp);
    element.removeEventListener('contextmenu', onContextMenu);
  };
}
