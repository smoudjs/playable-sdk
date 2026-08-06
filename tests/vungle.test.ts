const describeVungle = AD_NETWORK === 'vungle' ? describe : describe.skip;

function loadSDK() {
  jest.resetModules();
  return require('../src').default as typeof import('../src').default;
}

describeVungle('Vungle lifecycle', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('emits completion exactly once', () => {
    const postMessage = jest.spyOn(window.parent, 'postMessage').mockImplementation(() => {});
    const sdk = loadSDK();
    const finishListener = jest.fn();
    sdk.on('finish', finishListener);

    sdk.finish();
    sdk.finish();

    expect(finishListener).toHaveBeenCalledTimes(1);
    expect(postMessage).toHaveBeenCalledTimes(1);
    expect(postMessage).toHaveBeenCalledWith('complete', '*');
  });

  test('emits completion after legacy code mutates the public finished flag', () => {
    const postMessage = jest.spyOn(window.parent, 'postMessage').mockImplementation(() => {});
    const sdk = loadSDK();

    sdk.isFinished = true;
    sdk.finish();

    expect(postMessage).toHaveBeenCalledTimes(1);
    expect(postMessage).toHaveBeenCalledWith('complete', '*');
  });

  test('does not complete an unfinished playable on install', () => {
    const postMessage = jest.spyOn(window.parent, 'postMessage').mockImplementation(() => {});
    const sdk = loadSDK();
    const finishListener = jest.fn();
    const installListener = jest.fn();
    sdk.on('finish', finishListener);
    sdk.on('install', installListener);

    sdk.install();

    expect(finishListener).not.toHaveBeenCalled();
    expect(installListener).toHaveBeenCalledTimes(1);
    expect(postMessage).toHaveBeenCalledTimes(1);
    expect(postMessage).toHaveBeenCalledWith('download', '*');
  });

  test('keeps explicit completion before download', () => {
    const messages: string[] = [];
    jest.spyOn(window.parent, 'postMessage').mockImplementation((message) => {
      messages.push(String(message));
    });
    const sdk = loadSDK();

    sdk.finish();
    sdk.install();

    expect(messages).toEqual(['complete', 'download']);
  });

  test('boots while hidden and remains paused', () => {
    Object.defineProperty(document, 'readyState', { configurable: true, value: 'complete' });
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
    const sdk = loadSDK();
    const initCallback = jest.fn();

    sdk.init(initCallback);

    expect(initCallback).toHaveBeenCalledTimes(1);
    expect(sdk.isReady).toBe(true);
    expect(sdk.isPaused).toBe(true);
  });
});
