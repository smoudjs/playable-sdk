declare const mraid: {
  isReady: () => boolean;
  isViewable: () => boolean;
  getState: () => string;
  addEventListener: (
    event: 'viewableChange' | 'sizeChange' | 'ready' | 'audioVolumeChange' | 'stateChange' | 'error',
    callback: (...args: any[]) => void
  ) => void;
  removeEventListener: (
    event: 'viewableChange' | 'sizeChange' | 'ready' | 'audioVolumeChange' | 'stateChange' | 'error',
    callback: (...args: any[]) => void
  ) => void;
  getMaxSize: () => { width: number; height: number };
  openStoreUrl: () => void;
  open: (url: string) => void;
  preloadStore?: () => void;
};

declare const dapi: {
  addEventListener: (
    event: 'viewableChange' | 'adResized' | 'ready' | 'audioVolumeChange' | 'error',
    callback: (...args: any[]) => void
  ) => void;
  removeEventListener: (
    event: 'viewableChange' | 'adResized' | 'ready' | 'audioVolumeChange' | 'error',
    callback: (...args: any[]) => void
  ) => void;
  getScreenSize: () => { width: number; height: number };
  openStoreUrl: () => void;
  getAudioVolume: () => number;
  isViewable: () => boolean;
  isReady: () => boolean;
};

declare const NUC: {
  trigger: {
    convert: (destinationUrl: string) => void;
    tryAgain: Function;
  };
};

declare const FbPlayableAd: { onCTAClick: () => void };
declare const ExitApi: { exit: () => void };

declare const AD_NETWORK:
  | 'applovin'
  | 'unity'
  | 'google'
  | 'ironsource'
  | 'facebook'
  | 'moloco'
  | 'mintegral'
  | 'vungle'
  | 'adcolony'
  | 'tapjoy'
  | 'snapchat'
  | 'tiktok'
  | 'appreciate'
  | 'chartboost'
  | 'pangle'
  | 'mytarget'
  | 'liftoff';
declare const AD_PROTOCOL: 'mraid' | 'dapi' | 'nucleo' | 'none';
declare const GOOGLE_PLAY_URL: string;
declare const APP_STORE_URL: string;
declare const __DEV__: boolean;
declare const __BUILD_ID__: string;

// Mintegral functions
declare const gameStart: Function;
declare const gameClose: Function;

interface Window {
  plsdk: any;

  // Mintegral functions
  gameReady: Function;
  gameEnd: Function;
  gameRetry: Function;
  install: Function;
  mintGameStart: Function,
  mintGameClose: Function

  // Tapjoy functions
  TJ_API: {
    objectiveComplete: Function;
    playableFinished: Function;
    gameplayFinished: Function;
    setPlayableBuild: Function;
    setPlayableAPI: Function
    click: Function;
  };
  
  openAppStore: Function;
}
