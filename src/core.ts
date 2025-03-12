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

/**
 * Possible AD_NETWORK:
 * - applovin
 * - unity
 * - google
 * - ironsource
 * - facebook
 * - moloco
 * - mintegral
 * - vungle
 * - adcolony
 * - tapjoy
 * - snapchat
 * - tiktok
 * - appreciate
 * - chartboost
 * - pangle
 * - mytarget
 * - liftoff
 *
 * Possible AD_PROTOCOL:
 * - none
 * - mraid
 * - dapi
 */

const destinationUrl = /android/i.test(navigator.userAgent) ? GOOGLE_PLAY_URL : APP_STORE_URL;
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

function changeVolume(value: number) {
  emitEvent('volume', value);
}

function handlePause() {
  changeVolume(0);
  sdk.isPaused = true;
  emitEvent('pause');
}

function handleResume() {
  if (isForcePaused) return;
  changeVolume(sdk.volume);
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
      var screenSize = dapi.getScreenSize();
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
      var isViewable = mraid.isViewable();
      mraidIsViewable(isViewable);
    });

    if (mraid.isViewable() || AD_NETWORK == 'adcolony') {
      mraidIsViewable(true);
    }

    mraid.addEventListener('audioVolumeChange', function (newVolume: number | null) {
      if (newVolume !== null) {
        if (newVolume > 0) {
          changeVolume(sdk.volume);
        } else {
          changeVolume(0);
        }
      }
    });

    mraid.addEventListener('error', function (t, e) {
      console.log('mraid error: ' + t + '   action: ' + e);
    });

    mraid.addEventListener('sizeChange', function () {
      var maxSize = mraid.getMaxSize();
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

    var isAudioEnabled = !!dapi.getAudioVolume();
    dapi.addEventListener('audioVolumeChange', function (volume) {
      var isAudioEnabled = !!volume;
      if (isAudioEnabled) {
        changeVolume(sdk.volume);
      } else {
        changeVolume(0);
      }
    });

    dapi.addEventListener('adResized', function (event) {
      var maxSize = dapi.getScreenSize();
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
  if ('none' !== AD_PROTOCOL) return;

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
        if (sdk.isReady) {
          handleResume();
        } else {
          bootAd();
        }
      } else {
        handlePause();
      }
    });

    if (document.readyState === 'complete' || document.visibilityState === 'visible') {
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
      var tapjoyApi = {
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

class sdk {
  static version: string = '1.0.0';
  static maxWidth: number = Math.floor(window.innerWidth);
  static maxHeight: number = Math.floor(window.innerHeight);
  static isLandscape: boolean = window.innerWidth > window.innerHeight;

  static isReady: boolean = false;
  static isStarted: boolean = false;
  static isPaused: boolean = false;
  static isFinished: boolean = false;

  static volume: number = 1;
  static interactions: number = 0;

  static init(callback: InitCallbackType): void {
    if (isSDKInitialized) return;
    ensureProtocol();
    initCallback = callback;

    if ('mraid' === AD_PROTOCOL && isMraid()) {
      if (mraid.getState() !== 'ready' && 'adcolony' !== AD_NETWORK) {
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
          buildID: __BUILD_ID__
        });
      }

      sdk.resize();
    }
  }

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

  static retry(): void {
    if ('mintegral' === AD_NETWORK && isMintegral()) {
      window.gameRetry && window.gameRetry();
    } else if ('nucleo' === AD_PROTOCOL && isNucleo()) {
      NUC.trigger.tryAgain();
    }

    emitEvent('retry');
  }

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
      mraid.openStoreUrl ? mraid.openStoreUrl() : mraid.open(destinationUrl);
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

  static resize() {
    handleResize(sdk.maxWidth, sdk.maxHeight);
  }

  static pause(): void {
    if (!isForcePaused) {
      isForcePaused = true;
      handlePause();
    }
  }

  static resume(): void {
    if (isForcePaused) {
      isForcePaused = false;
      handleResume();
    }
  }

  static on(event: EventName, fn: Function, context?: any): void {
    onEvent(event, fn, context);
  }

  static once(event: EventName, fn: Function, context?: any): void {
    onEvent(event, fn, context, true);
  }

  static off(event: EventName, fn?: Function, context?: any): void {
    offEvent(event, fn, context);
  }
}

export { sdk };
window.PlayableSDK = sdk;
