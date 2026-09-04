import sdk from '../src';

type Point = { clientX: number; clientY: number };

function mouse(type: string, x: number, y: number, time: number): MouseEvent {
  const event = new MouseEvent(type, { clientX: x, clientY: y });
  Object.defineProperty(event, 'timeStamp', { value: time });
  return event;
}

function touch(type: string, x: number, y: number, time: number, remainingTouches: number): Event {
  const event = typeof TouchEvent !== 'undefined' ? new TouchEvent(type) : new Event(type);
  const changed: Point[] = [{ clientX: x, clientY: y }];
  Object.defineProperty(event, 'timeStamp', { value: time });
  Object.defineProperty(event, 'changedTouches', { value: changed });
  Object.defineProperty(event, 'touches', { value: { length: remainingTouches } });
  return event;
}

const dispatch = (event: Event) => document.dispatchEvent(event);

const log: string[] = [];
const record = (name: string) => (x: number, y: number) => log.push(`${name}:${x},${y}`);

const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
const registeredTypes = () => addEventListenerSpy.mock.calls.map((call) => call[0]);

sdk.init(() => sdk.start());

beforeAll(async () => {
  if (!sdk.isReady) {
    await new Promise((resolve) => sdk.on('ready', resolve));
  }
});

beforeEach(() => {
  log.length = 0;
});

// Runs first: nothing has subscribed to pointermove yet
test('move listeners are only attached once pointermove is subscribed', () => {
  expect(registeredTypes()).toEqual(expect.arrayContaining(['mousedown', 'touchstart', 'mouseup', 'touchend', 'touchcancel']));
  expect(registeredTypes()).not.toContain('mousemove');
  expect(registeredTypes()).not.toContain('touchmove');

  sdk.on('pointermove', record('move'));

  expect(registeredTypes()).toContain('mousemove');
  expect(registeredTypes()).toContain('touchmove');

  // Subscribing again does not attach duplicates
  const count = registeredTypes().length;
  sdk.on('pointermove', () => {});
  sdk.once('pointermove', () => {});
  expect(registeredTypes().length).toBe(count);

  sdk.off('pointermove');
});

test('a pressed finger keeps working when pointermove is subscribed mid-gesture', () => {
  // Fresh module state is not available, so emulate by subscribing after down
  dispatch(touch('touchstart', 1, 1, 100, 1));
  sdk.on('pointermove', record('move'));
  dispatch(touch('touchmove', 2, 2, 110, 1));
  dispatch(touch('touchend', 3, 3, 120, 0));

  expect(log).toEqual(['move:2,2']);
  sdk.off('pointermove');
});

describe('pointer events', () => {
  beforeAll(() => {
    sdk.on('pointerdown', record('down'));
    sdk.on('pointermove', record('move'));
    sdk.on('pointerup', record('up'));
  });

  test('mouse gesture emits down, move, up with coordinates', () => {
    const before = sdk.interactions;

    dispatch(mouse('mousedown', 10, 20, 1000));
    dispatch(mouse('mousemove', 15, 25, 1010));
    dispatch(mouse('mouseup', 20, 30, 1020));

    expect(log).toEqual(['down:10,20', 'move:15,25', 'up:20,30']);
    expect(sdk.interactions).toBe(before + 1);
  });

  test('move and up without a prior down are ignored', () => {
    dispatch(mouse('mousemove', 1, 1, 2000));
    dispatch(mouse('mouseup', 1, 1, 2010));
    dispatch(touch('touchmove', 1, 1, 2020, 1));
    dispatch(touch('touchend', 1, 1, 2030, 0));

    expect(log).toEqual([]);
  });

  test('hover moves after release are ignored', () => {
    dispatch(mouse('mousedown', 1, 1, 3000));
    dispatch(mouse('mouseup', 2, 2, 3010));
    dispatch(mouse('mousemove', 50, 50, 3020));
    dispatch(mouse('mousemove', 60, 60, 3030));

    expect(log).toEqual(['down:1,1', 'up:2,2']);
  });

  test('touch gesture emits down, move, up and counts one interaction', () => {
    const before = sdk.interactions;

    dispatch(touch('touchstart', 5, 6, 4000, 1));
    dispatch(touch('touchmove', 6, 7, 4010, 1));
    dispatch(touch('touchend', 7, 8, 4020, 0));

    expect(log).toEqual(['down:5,6', 'move:6,7', 'up:7,8']);
    expect(sdk.interactions).toBe(before + 1);
  });

  test('touchcancel is reported as pointerup', () => {
    dispatch(touch('touchstart', 1, 2, 5000, 1));
    dispatch(touch('touchcancel', 3, 4, 5010, 0));

    expect(log).toEqual(['down:1,2', 'up:3,4']);
  });

  test('browser-emulated mouse events right after a touch are dropped', () => {
    const before = sdk.interactions;

    dispatch(touch('touchstart', 5, 6, 6000, 1));
    dispatch(touch('touchend', 7, 8, 6300, 0));
    // Emulated mouse sequence dispatched by the browser shortly after touchend
    dispatch(mouse('mousemove', 5, 6, 6310));
    dispatch(mouse('mousedown', 5, 6, 6311));
    dispatch(mouse('mouseup', 7, 8, 6312));

    expect(log).toEqual(['down:5,6', 'up:7,8']);
    expect(sdk.interactions).toBe(before + 1);
  });

  test('dedupe window is measured from the last touch event, not the first', () => {
    // Long press: touchstart at 7000, touchend at 9000, emulated mouse at 9010
    dispatch(touch('touchstart', 1, 1, 7000, 1));
    dispatch(touch('touchend', 2, 2, 9000, 0));
    dispatch(mouse('mousedown', 1, 1, 9010));
    dispatch(mouse('mouseup', 2, 2, 9020));

    expect(log).toEqual(['down:1,1', 'up:2,2']);
  });

  test('a real mouse works again once the dedupe window has passed', () => {
    const before = sdk.interactions;

    dispatch(touch('touchstart', 1, 1, 10000, 1));
    dispatch(touch('touchend', 1, 1, 10010, 0));
    dispatch(mouse('mousedown', 20, 21, 10600));
    dispatch(mouse('mousemove', 22, 23, 10610));
    dispatch(mouse('mouseup', 24, 25, 10620));

    expect(log).toEqual(['down:1,1', 'up:1,1', 'down:20,21', 'move:22,23', 'up:24,25']);
    expect(sdk.interactions).toBe(before + 2);
  });

  test('switching back and forth between touch and mouse keeps working', () => {
    dispatch(mouse('mousedown', 1, 1, 20000));
    dispatch(mouse('mouseup', 1, 1, 20010));
    dispatch(touch('touchstart', 2, 2, 21000, 1));
    dispatch(touch('touchend', 2, 2, 21010, 0));
    dispatch(mouse('mousedown', 3, 3, 22000));
    dispatch(mouse('mouseup', 3, 3, 22010));

    expect(log).toEqual(['down:1,1', 'up:1,1', 'down:2,2', 'up:2,2', 'down:3,3', 'up:3,3']);
  });

  test('multi-touch keeps the pressed state until the last finger lifts', () => {
    const before = sdk.interactions;

    dispatch(touch('touchstart', 1, 1, 30000, 1)); // first finger
    dispatch(touch('touchstart', 9, 9, 30010, 2)); // second finger
    dispatch(touch('touchend', 1, 1, 30020, 1)); // first finger lifts, one remains
    dispatch(touch('touchmove', 8, 8, 30030, 1)); // second finger still moving
    dispatch(touch('touchend', 7, 7, 30040, 0)); // last finger lifts
    dispatch(touch('touchmove', 6, 6, 30050, 0)); // nothing pressed anymore

    expect(log).toEqual(['down:1,1', 'down:9,9', 'up:1,1', 'move:8,8', 'up:7,7']);
    expect(sdk.interactions).toBe(before + 2);
  });

  test('interaction fires before pointerdown and passes the running count', () => {
    const order: string[] = [];
    const onInteraction = (count: number) => order.push(`interaction:${count}`);
    const onDown = () => order.push('pointerdown');
    sdk.on('interaction', onInteraction);
    sdk.on('pointerdown', onDown);

    const before = sdk.interactions;
    dispatch(mouse('mousedown', 1, 1, 40000));
    dispatch(mouse('mouseup', 1, 1, 40010));

    expect(order).toEqual([`interaction:${before + 1}`, 'pointerdown']);

    sdk.off('interaction', onInteraction);
    sdk.off('pointerdown', onDown);
  });

  test('the original DOM event is passed as the third argument', () => {
    let received: Event | null = null;
    const onDown = (_x: number, _y: number, event: Event) => (received = event);
    sdk.on('pointerdown', onDown);

    const event = mouse('mousedown', 1, 1, 50000);
    dispatch(event);
    dispatch(mouse('mouseup', 1, 1, 50010));

    expect(received).toBe(event);
    sdk.off('pointerdown', onDown);
  });
});
