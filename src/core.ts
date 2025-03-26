import { emitEvent, EventName, offEvent, onEvent } from './events';
import {
  isDapi,
  isMraid,
  isNucleo,
  ensureProtocol,
  isGoogle,
  isTapjoy,
  isMintegral,
  isFacebook,
  isTikTok
} from './protocols';

type InitCallbackType = (maxWidth: number, maxHeight: number) => void;

let destinationUrl: string = '';
let isSDKInitialized: boolean = false;
let isProtocolInitialized: boolean = false;
let isForcePaused: boolean = false;
let isInstallClicked: boolean = false;

let initCallback: InitCallbackType = () => {};

function bootAd(): void {
  if (sdk.isReady) return;
  emitEvent('boot');
  document.body.oncontextmenu = function () {
    return false;
  };
  initCallback(sdk.maxWidth, sdk.maxHeight);
  emitEvent('ready');
  sdk.isReady = true;
}

function fireVolumeChange(value: number) {
  emitEvent('volume', value);
}

function changeVolume(value: number) {
  sdk.volume = value;
  fireVolumeChange(value);
}

function handlePause() {
  fireVolumeChange(0);
  sdk.isPaused = true;
  emitEvent('pause');
}

function handleResume() {
  if (isForcePaused) return;
  fireVolumeChange(sdk.volume);
  sdk.isPaused = false;
  emitEvent('resume');
}

function mraidIsViewable(viewable: boolean) {
  if ('mraid' !== AD_PROTOCOL) return;

  if (viewable) {
    if (sdk.isReady) {
      handleResume();
    } else {
      if (AD_NETWORK == 'ironsource') {
        const maxSize = mraid.getMaxSize();
        sdk.maxWidth = Math.floor(maxSize.width);
        sdk.maxHeight = Math.floor(maxSize.height);
      }
      bootAd();
    }
  } else {
    handlePause();
  }
}

function dapiIsViewable(event: { isViewable: boolean }) {
  if ('dapi' !== AD_PROTOCOL) return;

  if (event.isViewable) {
    if (sdk.isReady) {
      handleResume();
    } else {
      const screenSize = dapi.getScreenSize();
      screenSize.width = Math.floor(screenSize.width);
      screenSize.height = Math.floor(screenSize.height);
      bootAd();
    }
  } else {
    handlePause();
  }
}

function fireResizeEvent(width: number, height: number) {
  handleResize(width, height);
}

function startMraidProtocol() {
  if ('mraid' !== AD_PROTOCOL) return;

  if (!isProtocolInitialized) {
    mraid.removeEventListener('ready', startMraidProtocol);

    mraid.addEventListener('viewableChange', function () {
      const isViewable = mraid.isViewable();
      mraidIsViewable(isViewable);
    });

    if (mraid.isViewable() || AD_NETWORK == 'adcolony') {
      mraidIsViewable(true);
    }

    if (mraid.getAudioVolume) {
      const isAudioEnabled = mraid.getAudioVolume();
      if (isAudioEnabled) {
        changeVolume(1);
      } else {
        changeVolume(0);
      }
    }
    mraid.addEventListener('audioVolumeChange', function (newVolume: number | null) {
      if (newVolume !== null) {
        if (newVolume > 0) {
          // changeVolume(newVolume / 100); // Need to double check if this is proper way
          changeVolume(1);
        } else {
          changeVolume(0);
        }
      }
    });

    mraid.addEventListener('error', function (t, e) {
      console.log('mraid error: ' + t + '   action: ' + e);
    });

    mraid.addEventListener('sizeChange', function () {
      const maxSize = mraid.getMaxSize();
      fireResizeEvent(maxSize.width, maxSize.height);
    });

    // mraid.addEventListener('stateChange', function (t) {});

    isProtocolInitialized = true;
  }
}

function startDapiProtocol() {
  if ('dapi' !== AD_PROTOCOL) return;

  if (!isProtocolInitialized) {
    dapi.removeEventListener('ready', startDapiProtocol);

    const isAudioEnabled = dapi.getAudioVolume();
    if (isAudioEnabled) {
      changeVolume(1);
    } else {
      changeVolume(0);
    }
    dapi.addEventListener('audioVolumeChange', function (volume) {
      const isAudioEnabled = !!volume;
      if (isAudioEnabled) {
        changeVolume(1);
      } else {
        changeVolume(0);
      }
    });

    dapi.addEventListener('adResized', function (event) {
      const maxSize = dapi.getScreenSize();
      fireResizeEvent(event.width || maxSize.width, event.height || maxSize.height);
    });

    if (dapi.isViewable()) {
      dapiIsViewable({ isViewable: true });
    }

    dapi.addEventListener('viewableChange', dapiIsViewable);
    isProtocolInitialized = true;
  }
}

function startDefaultProtocol() {
  if (!isProtocolInitialized) {
    if ('mintegral' === AD_NETWORK) {
      window.mintGameStart = function () {
        handleResume();
        handleResize(sdk.maxWidth, sdk.maxHeight);
      };
      window.mintGameClose = function () {
        handlePause();
      };
    }

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        handleResume();
      } else {
        handlePause();
      }
    });

    if (document.readyState === 'complete') {
      bootAd();
    } else {
      window.addEventListener('load', () => {
        bootAd();
      });
    }

    window.addEventListener('resize', function () {
      handleResize();
    });

    if ('tapjoy' === AD_NETWORK && isTapjoy()) {
      const tapjoyApi = {
        skipAd: function () {
          try {
            sdk.finish();
          } catch (e) {
            console.warn('Could not skip ad! | ' + e);
          }
        }
      };

      window.TJ_API.setPlayableAPI && window.TJ_API.setPlayableAPI(tapjoyApi);
    }

    isProtocolInitialized = true;
  }
}

function finishTapjoy(): void {
  window.TJ_API.objectiveComplete && window.TJ_API.objectiveComplete();
  window.TJ_API.playableFinished && window.TJ_API.playableFinished();
  window.TJ_API.gameplayFinished && window.TJ_API.gameplayFinished();
}

function handleResize(width?: number, height?: number) {
  sdk.maxWidth = Math.floor(width || window.innerWidth);
  sdk.maxHeight = Math.floor(height || window.innerHeight);

  sdk.isLandscape = sdk.maxWidth > sdk.maxHeight;

  emitEvent('resize', sdk.maxWidth, sdk.maxHeight);
}

let isListeningToTouchEvents = false;
let isTouchEventRegistered = false;
function onUserInteraction(event: Event): void {
  if (typeof TouchEvent !== 'undefined' && event instanceof TouchEvent) {
    isListeningToTouchEvents = true;
  }

  if (isListeningToTouchEvents && event instanceof MouseEvent) return;

  sdk.interactions += 1;
  emitEvent('interaction', sdk.interactions);
}

function registerTouchHandlers(): void {
  if (!isTouchEventRegistered) {
    document.addEventListener('mousedown', onUserInteraction);
    document.addEventListener('touchstart', onUserInteraction);
    isTouchEventRegistered = true;
  }
}

/**
 * Main SDK class providing playable ad functionality and state management.
 * Handles initialization, lifecycle events, and interactions across different ad networks.
 */
class sdk {
  /** Current version of the SDK */
  static version: string = __NPM_PACKAGE_VERSION__;

  /** Current maximum width of the playable ad container in pixels */
  static maxWidth: number = Math.floor(window.innerWidth);

  /** Current maximum height of the playable ad container in pixels */
  static maxHeight: number = Math.floor(window.innerHeight);

  /** Indicates if the current orientation is landscape (width > height) */
  static isLandscape: boolean = window.innerWidth > window.innerHeight;

  /** Indicates if the Ad Network is ready and playable ad can be initialized */
  static isReady: boolean = false;

  /** Indicates if all playable ad resources are loaded and gameplay has started */
  static isStarted: boolean = false;

  /** Indicates if the playable ad is currently paused */
  static isPaused: boolean = false;

  /** Indicates if the playable ad has finished */
  static isFinished: boolean = false;

  /** Current volume level (0-1) */
  static volume: number = 1;

  /** Number of user interactions with the playable ad */
  static interactions: number = 0;

  /**
   * Initializes the SDK and sets up protocol-specific handlers.
   * This must be called as earlier as possible.
   *
   * @param callback Optional function called when ad container is ready
   * @example
   * // Basic initialization
   * sdk.init();
   *
   * // Initialization with callback
   * sdk.init((width, height) => {
   *   new App(width, height)
   * });
   *
   * @fires init When initialization starts
   * @fires boot When the ad begins booting
   * @fires ready When Ad Network is ready and playable ad can be initialized
   */
  static init(callback?: InitCallbackType): void {
    if (isSDKInitialized) return;
    destinationUrl = /android/i.test(navigator.userAgent) ? GOOGLE_PLAY_URL : APP_STORE_URL;
    ensureProtocol();

    if (callback) initCallback = callback;

    if ('mraid' === AD_PROTOCOL && isMraid()) {
      if (mraid.getState() !== 'ready') {
        mraid.addEventListener('ready', startMraidProtocol);
      } else {
        startMraidProtocol();
      }
    } else if ('dapi' === AD_PROTOCOL && isDapi()) {
      window.addEventListener('load', function () {
        dapi.isReady() ? startDapiProtocol() : dapi.addEventListener('ready', startDapiProtocol);
      });
    } else {
      startDefaultProtocol();
    }

    emitEvent('init');
    isSDKInitialized = true;
  }

  /**
   * Starts the playable ad experience.
   * Should be called after all resources are loaded and first frame is rendered.
   *
   * @example
   * // Call just after all resources are preloaded and first frame is rendered
   * sdk.start();
   *
   * @fires start When the playable ad starts
   * @fires resize When the ad container is initially sized
   */
  static start(): void {
    if (sdk.isStarted) return;
    sdk.isStarted = true;

    emitEvent('start');
    registerTouchHandlers();

    if ('mintegral' === AD_NETWORK && isMintegral()) {
      sdk.resize();
      handlePause();
      window.gameReady && window.gameReady();
    } else {
      if ('tapjoy' === AD_NETWORK && isTapjoy()) {
        window.TJ_API.setPlayableBuild({
          orientation: this.isLandscape ? 'landscape' : 'portrait',
          buildID: BUILD_HASH
        });
      }
      fireVolumeChange(sdk.volume);
      sdk.resize();
    }
  }

  /**
   * Marks the playable ad as finished.
   * This triggers network-specific completion handlers.
   *
   * @example
   * // Call when game/experience is complete
   * sdk.finish();
   *
   * @fires finish When the playable ad is marked as finished
   */
  static finish(): void {
    sdk.isFinished = true;

    if ('tapjoy' === AD_NETWORK && isTapjoy()) {
      finishTapjoy();
    } else if ('mintegral' === AD_NETWORK && isMintegral()) {
      window.gameEnd && window.gameEnd();
    } else if ('vungle' === AD_NETWORK) {
      parent.postMessage('complete', '*');
    }

    emitEvent('finish');
  }

  /**
   * Triggers a retry/restart of the playable ad.
   * Behavior varies by ad network.
   *
   * @example
   * // Allow user to try again
   * retryButton.onclick = () => sdk.retry();
   *
   * @fires retry When a retry is triggered
   */
  static retry(): void {
    if ('mintegral' === AD_NETWORK && isMintegral()) {
      // window.gameRetry && window.gameRetry();
    } else if ('nucleo' === AD_PROTOCOL && isNucleo()) {
      NUC.trigger.tryAgain();
    }

    emitEvent('retry');
  }

  /**
   * Triggers the install/download action for the advertised app.
   * Handles different store opening methods across ad networks.
   *
   * @example
   * // Call when user wants to install
   * installButton.onclick = () => sdk.install();
   *
   * @fires finish If the ad hasn't been marked as finished
   * @fires install When the install action is triggered
   */
  static install(): void {
    if (!sdk.isFinished) {
      sdk.isFinished = true;

      let timeout = 0;
      if ('tapjoy' === AD_NETWORK && isTapjoy()) {
        finishTapjoy();
        timeout = 300;
      }

      emitEvent('finish');

      setTimeout(function () {
        sdk.install();
      }, timeout);
      return;
    }

    if (isInstallClicked) return;
    isInstallClicked = true;
    setTimeout(function () {
      isInstallClicked = false;
    }, 500);

    emitEvent('install');

    if ('mraid' === AD_PROTOCOL && isMraid()) {
      mraid.open(destinationUrl);
    } else if ('dapi' === AD_PROTOCOL && isDapi()) {
      dapi.openStoreUrl();
    } else if ('nucleo' === AD_PROTOCOL && isNucleo()) {
      NUC.trigger.convert(destinationUrl);
    } else if ('facebook' == AD_NETWORK && isFacebook()) {
      FbPlayableAd.onCTAClick();
    } else if ('vungle' == AD_NETWORK) {
      parent.postMessage('download', '*');
    } else if ('google' == AD_NETWORK && isGoogle()) {
      ExitApi.exit();
    } else if ('mintegral' === AD_NETWORK && isMintegral()) {
      window.install && window.install();
    } else if ('tapjoy' === AD_NETWORK && isTapjoy()) {
      window.TJ_API.click();
    } else if ('tiktok' === AD_NETWORK && isTikTok()) {
      window.openAppStore();
    } else {
      window.open(destinationUrl);
    }
  }

  /**
   * Trigger force resize event
   * Useful when container size changes need to be manually propagated.
   *
   * @example
   * sdk.resize();
   *
   * @fires resize With current maxWidth and maxHeight
   */
  static resize() {
    handleResize(sdk.maxWidth, sdk.maxHeight);
  }

  /**
   * Forces the playable ad into a paused state.
   *
   * @example
   * // Pause the experience
   * pauseButton.onclick = () => sdk.pause();
   *
   * @fires pause When the ad enters paused state
   */
  static pause(): void {
    if (!isForcePaused) {
      isForcePaused = true;
      handlePause();
    }
  }

  /**
   * Resumes the playable ad from a forced pause state.
   * Only works if the ad was paused via sdk.pause().
   *
   * @example
   * // Resume from pause
   * resumeButton.onclick = () => sdk.resume();
   *
   * @fires resume When the ad resumes from pause
   */
  static resume(): void {
    if (isForcePaused) {
      isForcePaused = false;
      handleResume();
    }
  }

  /**
   * Registers an event listener.
   *
   * @param event Name of the event to listen for
   * @param fn Callback function to execute when event occurs
   * @param context Optional 'this' context for the callback
   *
   * @example
   * // Listen for user interactions
   * sdk.on('interaction', (count) => {
   *   console.log(`User interaction #${count}`);
   * });
   *
   * // Listen for resize with context
   * sdk.on('resize', function(width, height) {
   *   this.updateLayout(width, height);
   * }, gameInstance);
   */
  static on(event: EventName, fn: Function, context?: any): void {
    onEvent(event, fn, context);
  }

  /**
   * Registers a one-time event listener that removes itself after execution.
   *
   * @param event Name of the event to listen for
   * @param fn Callback function to execute when event occurs
   * @param context Optional 'this' context for the callback
   *
   * @example
   * // Listen for first interaction only
   * sdk.once('interaction', () => {
   *   console.log('First user interaction occurred!');
   * });
   */
  static once(event: EventName, fn: Function, context?: any): void {
    onEvent(event, fn, context, true);
  }

  /**
   * Removes an event listener.
   *
   * @param event Name of the event to stop listening for
   * @param fn Optional callback function to remove (if not provided, removes all listeners for the event)
   * @param context Optional 'this' context to match when removing
   *
   * @example
   * // Remove specific listener
   * const handler = () => console.log('Interaction');
   * sdk.off('interaction', handler);
   *
   * // Remove all listeners for an event
   * sdk.off('interaction');
   */
  static off(event: EventName, fn?: Function, context?: any): void {
    offEvent(event, fn, context);
  }
}

window['console'].log(
  `%c @smoud/playable-sdk %c v${sdk.version} `,
  'background: #007acc; color: #fff; font-size: 14px; padding: 4px 8px; border-top-left-radius: 4px; border-bottom-left-radius: 4px;',
  'background: #e1e4e8; color: #333; font-size: 14px; padding: 4px 8px; border-top-right-radius: 4px; border-bottom-right-radius: 4px;'
);

export { sdk };
window.PlayableSDK = sdk;
