let uid = 0;

const NONE = uid++;
const MRAID = uid++;
const DAPI = uid++;
const NUCLEO = uid++;
const FACEBOOK = uid++;
const GOOGLE = uid++;
const MINTEGRAL = uid++;
const TAPJOY = uid++;
const TIKTOK = uid++;
const SMADEX = uid++;

let actualProtocol = NONE;

export function isMraid(): boolean {
  return actualProtocol === MRAID;
}

export function isDapi(): boolean {
  return actualProtocol === DAPI;
}

export function isNucleo(): boolean {
  return actualProtocol === NUCLEO;
}

export function isFacebook(): boolean {
  return actualProtocol === FACEBOOK;
}

export function isSmadex(): boolean {
  return actualProtocol === SMADEX;
}

export function isGoogle(): boolean {
  return actualProtocol === GOOGLE;
}

export function isMintegral(): boolean {
  return actualProtocol === MINTEGRAL;
}

export function isTapjoy(): boolean {
  return actualProtocol === TAPJOY;
}

export function isTikTok(): boolean {
  return actualProtocol === TIKTOK;
}

export function ensureProtocol(): void {
  if ('mraid' === AD_PROTOCOL) {
    try {
      mraid.getState();
      actualProtocol = MRAID;
    } catch (error) {}
  } else if ('dapi' === AD_PROTOCOL) {
    try {
      dapi.isReady();
      actualProtocol = DAPI;
    } catch (error) {}
  } else if ('facebook' === AD_NETWORK) {
    try {
      if (FbPlayableAd) actualProtocol = FACEBOOK;
    } catch (error) {}
  } else if ('google' === AD_NETWORK) {
    try {
      if (ExitApi) actualProtocol = GOOGLE;
    } catch (error) {}
  } else if ('mintegral' === AD_NETWORK) {
    if (window.gameReady) actualProtocol = MINTEGRAL;
  } else if ('tapjoy' === AD_NETWORK) {
    if (window.TJ_API) actualProtocol = TAPJOY;
  } else if ('tiktok' === AD_NETWORK) {
    if (window.openAppStore) actualProtocol = TIKTOK;
  } else if ('smadex' === AD_NETWORK) {
    try {
      if (smxTracking) actualProtocol = SMADEX;
    } catch (error) {}
  }
}
