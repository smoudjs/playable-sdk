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

type RegisteredEvent = {
  list: any[];
};

const registeredEvents: Record<string, RegisteredEvent> = {};

export function onEvent(event: EventName, fn: Function, context?: any, once?: boolean) {
  let listeners = registeredEvents[event];

  if (!listeners) {
    listeners = registeredEvents[event] = {
      list: []
    };
  }

  listeners.list.push(fn, context || null, once || false);
}

export function offEvent(event: EventName, fn?: Function, context?: any): void {
  const listeners = registeredEvents[event];
  if (!listeners) return;
  const fnArray = listeners.list;

  if (!fn) {
    fnArray.length = 0;
  } else {
    let i = fnArray.length;
    while (i > 0) {
      i -= 3;
      if (fnArray[i] == fn && (context !== undefined || fnArray[i + 1] == context)) {
        fnArray.splice(i, 3);
      }
    }
  }

  if (fnArray.length == 0) {
    delete registeredEvents[event];
  }
}

export function emitEvent(event: EventName, a1?: any, a2?: any, a3?: any): void {
  const listeners = registeredEvents[event];
  if (!listeners) return;

  const fnArray = listeners.list;
  const len = arguments.length;
  let fn, ctx;

  for (let i = 0; i < fnArray.length; i += 3) {
    fn = fnArray[i];
    ctx = fnArray[i + 1];

    if (fnArray[i + 2]) {
      fnArray.splice(i, 3);
      i -= 3;
    }

    if (len <= 1) fn.call(ctx);
    else if (len == 2) fn.call(ctx, a1);
    else if (len == 3) fn.call(ctx, a1, a2);
    else fn.call(ctx, a1, a2, a3);
  }

  if (fnArray.length == 0) {
    delete registeredEvents[event];
  }
}
