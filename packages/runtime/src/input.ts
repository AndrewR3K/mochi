export interface PointerState {
  x: number;
  y: number;
  deltaX: number;
  deltaY: number;
  buttons: ReadonlySet<number>;
}

export interface InputState {
  keys: ReadonlySet<string>;
  pressedKeys: ReadonlySet<string>;
  pointer: PointerState;
  isKeyDown(code: string): boolean;
  wasKeyPressed(code: string): boolean;
  isPointerButtonDown(button: number): boolean;
}

export interface InputWriter {
  setKey(code: string, down: boolean): void;
  setPointerPosition(x: number, y: number, deltaX?: number, deltaY?: number): void;
  setPointerButton(button: number, down: boolean): void;
  resetFrame(): void;
  clear(): void;
}

export interface InputController {
  readonly state: InputState;
  readonly writer: InputWriter;
}

export function createInputController(): InputController {
  const keys = new Set<string>();
  const pressedKeys = new Set<string>();
  const buttons = new Set<number>();
  const pointer: PointerState = {
    x: 0,
    y: 0,
    deltaX: 0,
    deltaY: 0,
    buttons,
  };

  const state: InputState = {
    keys,
    pressedKeys,
    pointer,
    isKeyDown: (code) => keys.has(code),
    wasKeyPressed: (code) => pressedKeys.has(code),
    isPointerButtonDown: (button) => buttons.has(button),
  };

  const writer: InputWriter = {
    setKey(code, down) {
      if (down) {
        if (!keys.has(code)) pressedKeys.add(code);
        keys.add(code);
      } else {
        keys.delete(code);
      }
    },
    setPointerPosition(x, y, deltaX = x - pointer.x, deltaY = y - pointer.y) {
      pointer.x = x;
      pointer.y = y;
      pointer.deltaX += deltaX;
      pointer.deltaY += deltaY;
    },
    setPointerButton(button, down) {
      if (down) buttons.add(button);
      else buttons.delete(button);
    },
    resetFrame() {
      pressedKeys.clear();
      pointer.deltaX = 0;
      pointer.deltaY = 0;
    },
    clear() {
      keys.clear();
      pressedKeys.clear();
      buttons.clear();
      pointer.x = 0;
      pointer.y = 0;
      pointer.deltaX = 0;
      pointer.deltaY = 0;
    },
  };

  return { state, writer };
}
