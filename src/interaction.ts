import { sdk } from './core';
import { emitEvent, EventName } from './events';

/** Mouse events arriving within this window after a touch event are treated as browser-emulated duplicates */
const TOUCH_MOUSE_DEDUPE_MS = 500;

let lastTouchTime = 0;
let isPointerDown = false;
let isRegistered = false;
let isMoveRegistered = false;

/**
 * Creates a unified mouse/touch handler that emits the given pointer event with `(x, y, originalEvent)`.
 * - Emulated mouse events fired shortly after a touch are dropped, so a real mouse keeps working on hybrid devices.
 * - `pointermove` and `pointerup` are only emitted while the pointer is pressed (between down and up).
 */
function createPointerHandler(name: EventName) {
  return function (event: MouseEvent | TouchEvent): void {
    const touches = (event as TouchEvent).changedTouches;
    let point: { clientX: number; clientY: number } = event as MouseEvent;

    if (touches) {
      lastTouchTime = event.timeStamp;
      point = touches[0];
    } else if (event.timeStamp - lastTouchTime < TOUCH_MOUSE_DEDUPE_MS) return;

    if (name === 'pointerdown') {
      isPointerDown = true;
      sdk.interactions += 1;
      emitEvent('interaction', sdk.interactions);
    } else if (!isPointerDown) return;
    else if (name === 'pointerup') isPointerDown = !!touches && (event as TouchEvent).touches.length > 0;

    emitEvent(name, point.clientX, point.clientY, event);
  };
}

const onPointerDown = createPointerHandler('pointerdown');
const onPointerMove = createPointerHandler('pointermove');
const onPointerUp = createPointerHandler('pointerup');

function listen(type: string, handler: (event: any) => void): void {
  document.addEventListener(type, handler);
}

/**
 * Down/up listeners are always attached so the pressed state and `interaction` counter stay correct.
 * Move listeners are high-frequency, so they are only attached once someone subscribes to `pointermove`.
 */
export function registerInteractionHandlers(): void {
  if (isRegistered) return;
  isRegistered = true;

  listen('mousedown', onPointerDown);
  listen('touchstart', onPointerDown);
  listen('mouseup', onPointerUp);
  listen('touchend', onPointerUp);
  listen('touchcancel', onPointerUp);
}

export function registerMoveHandler(): void {
  if (isMoveRegistered) return;
  isMoveRegistered = true;

  listen('mousemove', onPointerMove);
  listen('touchmove', onPointerMove);
}
