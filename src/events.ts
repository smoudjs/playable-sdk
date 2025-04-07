export type EventName =
  | 'init'
  | 'boot'
  | 'ready'
  | 'start'
  | 'interaction'
  | 'resize'
  | 'pause'
  | 'resume'
  | 'volume'
  | 'retry'
  | 'finish'
  | 'install';

type RegisteredEvent = any[];

const registeredEvents: Record<string, RegisteredEvent> = {};

export function onEvent(event: EventName, fn: Function, context?: any, once?: boolean) {
  let listeners = registeredEvents[event];

  if (!listeners) {
    listeners = registeredEvents[event] = [];
  }

  listeners.push(fn, context || null, once || false);
}

export function offEvent(event: EventName, fn?: Function, context?: any): void {
  const listeners = registeredEvents[event];
  if (!listeners) return;

  if (!fn) {
    delete registeredEvents[event];
  } else {
    const events: any[] = [];

    for (let i = 0; i < listeners.length; i += 3) {
      if (listeners[i] !== fn || (context !== undefined && listeners[i + 1] !== context)) {
        events.push(listeners[i], listeners[i + 1], listeners[i + 2]);
      }
    }

    if (events.length === 0) delete registeredEvents[event];
    else registeredEvents[event] = events;
  }
}

export function emitEvent(event: EventName, a1?: any, a2?: any, a3?: any): void {
  const listeners = registeredEvents[event];
  if (!listeners || listeners.length === 0) return;

  const len = arguments.length;
  const listenersLen = listeners.length;
  let fn, ctx;

  for (let i = 0; i < listenersLen; i += 3) {
    fn = listeners[i];
    ctx = listeners[i + 1];

    if (listeners[i + 2]) offEvent(event, fn, ctx);

    if (len <= 1) fn.call(ctx);
    else if (len == 2) fn.call(ctx, a1);
    else if (len == 3) fn.call(ctx, a1, a2);
    else fn.call(ctx, a1, a2, a3);
  }
}
