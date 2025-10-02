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
  getAudioVolume: () => number;
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
declare const smxTracking: { redirect: () => void };
declare const ExitApi: { exit: () => void };

declare const AD_NETWORK:
  | 'preview'
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
  | 'liftoff'
  | 'smadex'
  | 'adikteev'
  | 'bigabid'
  | 'inmobi';

declare const AD_PROTOCOL: 'mraid' | 'dapi' | 'nucleo' | 'none';
declare const GOOGLE_PLAY_URL: string;
declare const APP_STORE_URL: string;
declare const BUILD_HASH: string;

interface Window {
  PlayableSDK: any;

  // Mintegral functions
  gameReady: Function;
  gameEnd: Function;
  gameRetry: Function;
  install: Function;
  mintGameStart: Function;
  mintGameClose: Function;

  // Tapjoy functions
  TJ_API: {
    objectiveComplete: Function;
    playableFinished: Function;
    gameplayFinished: Function;
    setPlayableBuild: Function;
    setPlayableAPI: Function;
    click: Function;
  };

  BIGABID_BIDTIMEMACROS?: Record<string, string>
  INMOBI_DSPMACROS?: Record<string, string>

  openAppStore: Function;
}
