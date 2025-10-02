import { sdk } from './core';

export function initTrackingProtocols(): void {
  if (AD_NETWORK === 'bigabid' || AD_NETWORK === 'inmobi') {
    function trackURL(url: string): void {
      if (url) {
        const trackingPixel = new Image();
        trackingPixel.src = url;
      }
    }

    if (AD_NETWORK === 'bigabid') {
      function trackBigabidEvent(event: string): void {
        if (window.BIGABID_BIDTIMEMACROS && window.BIGABID_BIDTIMEMACROS[event])
          trackURL(window.BIGABID_BIDTIMEMACROS[event]);
      }
      var completeTriggered = false;
      function trackComplete() {
        if (!completeTriggered) trackBigabidEvent('complete');
        completeTriggered = true;
      }

      sdk.once('boot', () => trackBigabidEvent('mraid_viewable'));
      sdk.once('start', () => trackBigabidEvent('game_viewable'));
      sdk.once('interaction', () => trackBigabidEvent('engagement'));
      sdk.once('finish', trackComplete);
      sdk.on('interaction', (interactions: number) => {
        if (interactions > 3) trackComplete();
      });
      sdk.once('install', () => trackBigabidEvent('click'));
    } else if (AD_NETWORK === 'inmobi') {
      function trackInMobiEvent(event: string): void {
        if (window.INMOBI_DSPMACROS && window.INMOBI_DSPMACROS[event]) trackURL(window.INMOBI_DSPMACROS[event]);
      }

      sdk.once('boot', () => trackInMobiEvent('Ad_Load_Start'));
      sdk.once('start', () => trackInMobiEvent('Ad_Viewable'));
      sdk.once('interaction', () => trackInMobiEvent('First_Engagement'));
      sdk.once('finish', () => trackInMobiEvent('Gameplay_Complete'));
      sdk.once('install', () => trackInMobiEvent('DSP_Click'));
      sdk.once('start', () => {
        setTimeout(() => trackInMobiEvent('Spent_5_Seconds'), 5000);
        setTimeout(() => trackInMobiEvent('Spent_10_Seconds'), 10000);
        setTimeout(() => trackInMobiEvent('Spent_15_Seconds'), 15000);
        setTimeout(() => trackInMobiEvent('Spent_20_Seconds'), 20000);
        setTimeout(() => trackInMobiEvent('Spent_25_Seconds'), 25000);
        setTimeout(() => trackInMobiEvent('Spent_30_Seconds'), 30000);
      });
    }
  }
}
