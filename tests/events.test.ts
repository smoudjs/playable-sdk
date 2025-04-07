import { emitEvent, offEvent, onEvent } from '../src/events';

test('Events basics works correctly', () => {
  let testVar = 'test';

  onEvent('boot', (e: string) => (testVar = e));
  emitEvent('boot', 'foo');
  emitEvent('boot', 'foo2');
  expect(testVar).toBe('foo2');

  offEvent('boot');

  emitEvent('boot', 'bar');
  expect(testVar).toBe('foo2');

  onEvent('boot', (e: string) => (testVar = e), null, true);
  emitEvent('boot', '1st');
  emitEvent('boot', '2nd');
  expect(testVar).toBe('1st');
});

test('Events context works correctly', () => {
  let pattern = '';

  function writer(this: string) {
    pattern += this;
  }

  onEvent('ready', writer, 'foo');
  onEvent('ready', writer, 'baz');
  onEvent('ready', writer, 'bar', true);
  onEvent('ready', writer, 'banana', true);

  emitEvent('ready');
  expect(pattern).toBe('foobazbarbanana');

  emitEvent('ready');
  expect(pattern).toBe('foobazbarbananafoobaz');
});

it('Events data retreives works correctly', function () {
  const obj = {};

  onEvent('init', function (a: string, b: any, c: Date, undef: undefined) {
    expect(a).toEqual('foo');
    expect(b).toEqual(obj);
    expect(c).toBeInstanceOf(Date);
    expect(undef).toEqual(undefined);
    expect(arguments.length).toEqual(3);
  });

  // @ts-ignore
  emitEvent('init', 'foo', obj, new Date(), 'something will be ignored');
});

it('Events listeners callabck called in right order', function () {
  const pattern: string[] = [];

  onEvent('finish', function () {
    pattern.push('foo1');
  });

  onEvent('finish', function () {
    pattern.push('foo2');
  });

  emitEvent('finish');

  expect(pattern.join(';')).toEqual('foo1;foo2');
});

it('Events cleared corectly', function () {
  let testVar = 'initial';

  function f1() {
    throw new Error('Ooops, function 1 called');
  }
  function f2() {
    throw new Error('Ooops, function 2 called');
  }
  function f3() {
    throw new Error('Ooops, function 3 called');
  }
  function f4(param: string) {
    testVar = param;
  }

  onEvent('install', f1);
  onEvent('install', f1);
  offEvent('install', f1);

  emitEvent('install');

  onEvent('install', f2, 3);
  onEvent('install', f2, 4);
  onEvent('install', f4, 5);
  offEvent('install', f2, 3);
  offEvent('install', f2, 4);

  emitEvent('install', 'foo');
  expect(testVar).toEqual('foo');

  onEvent('install', f3, 'context');
  onEvent('install', f3, {});
  offEvent('install', f3);

  emitEvent('install');
});

it('Events are working correctly with nestings', function () {
  let testVar = 'initial';
  let counter = 0;

  function test1() {
    offEvent('pause', test1);
    counter++;
  }

  function test2() {
    testVar = 'foo';
  }

  onEvent('pause', test1);
  onEvent('pause', test2);

  emitEvent('pause');

  expect(testVar).toBe('foo');
  expect(counter).toBe(1);

  emitEvent('pause');

  expect(counter).toBe(1);

  counter = 0;
  onEvent('resume', () => {
    onEvent('resume', () => {
      counter++;
    });
  });

  emitEvent('resume');
  expect(counter).toBe(0);
  emitEvent('resume');
  expect(counter).toBe(1);
  emitEvent('resume');
  expect(counter).toBe(3);
  emitEvent('resume');
  emitEvent('resume');
  expect(counter).toBe(10);
});
