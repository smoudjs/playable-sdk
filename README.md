# @smoud/playable-sdk

[![npm version](https://img.shields.io/npm/v/@smoud/playable-sdk)](https://www.npmjs.com/package/@smoud/playable-sdk)
[![npm downloads](https://badgen.net/npm/dw/@smoud/playable-sdk)](https://www.npmjs.com/package/@smoud/playable-sdk)
[![build size](https://badgen.net/bundlephobia/min/@smoud/playable-sdk)](https://www.npmjs.com/package/@smoud/playable-sdk)
[![DeepScan grade](https://deepscan.io/api/teams/19616/projects/29066/branches/935410/badge/grade.svg)](https://github.com/smoudjs/playable-sdk)
[![License](https://img.shields.io/npm/l/@smoud/playable-sdk)](https://github.com/smoudjs/playable-sdk/blob/master/LICENSE)

It's powerful, unified SDK that seamlessly integrates multiple ad network SDKs, including MRAID, Google, Facebook, Vungle, and many more. Designed for effortless playable ad development, it provides a standardized interface, ensuring compatibility, optimization, and easy deployment across various platforms. With `@smoud/playable-sdk`, you can streamline your workflow, maximize reach, and focus on crafting engaging interactive ads without worrying about SDK fragmentation. 🚀

## Features

- 🌐 **Universal Compatibility**: Works with all major ad networks
- 🔄 **Standardized Interface**: Single API for all supported networks
- 📱 **Responsive Design**: Automatic handling of orientation and resize events
- 🎮 **Game State Management**: Built-in pause/resume and lifecycle management
- 🔊 **Audio Control**: Volume management across different networks
- 📊 **Interaction Tracking**: Built-in user interaction monitoring
- ⚡ **Lightweight**: No external dependencies

## Supported Ad Networks

### Ad Network supports

- IronSource (MRAID/DAPI)
- AppLovin
- Unity Ads
- Google Ads
- Meta (Facebook)
- Moloco
- Mintegral
- Vungle
- TapJoy
- Snapchat
- TikTok
- Appreciate
- Pangle
- Liftoff
- Chartboost
- AdColony
- MyTarget
- Smadex
- Adikteev
- Bigabid
- inMobi

### Protocol Support

The SDK automatically detects and adapts to the appropriate ad network protocol:

- MRAID Protocol (v2/v3)
- DAPI Protocol (Display Ad Protocol Interface)
- Network-specific protocols (Facebook, Google, etc.)

## Installation

```bash
npm install @smoud/playable-sdk
```

## Quick Start

```javascript
import { sdk } from '@smoud/playable-sdk';

// Initialize the SDK as early as possible
sdk.init((width, height) => {
  // Initialize your game/app with container dimensions
  new Game(width, height);
});
```

```javascript
// Listen for events
sdk.on('resize', (width, height) => {
  game.resize(width, height);
});

sdk.on('pause', game.pause, game);
sdk.on('resume', game.resume, game);
sdk.on('volume', game.volume, game);
sdk.on('finish', game.finish, game);

sdk.on('interaction', (count) => {
  console.log(`User interaction count: ${count}`);
});
```

```javascript
// Start the playable when resources are loaded
sdk.start();
```

```javascript
// Mark playable as complete
sdk.finish();

// Handle install/download action
installButton.onclick = () => sdk.install();
```

## Build

### @smoud/playable-scripts

`@smoud/playable-sdk` works best with the [`@smoud/playable-scripts`](https://www.npmjs.com/package/@smoud/playable-scripts) package, which helps you prepare **playable ad builds** that are ready for multiple ad networks. Using `playable-scripts` provides key benefits:

- 🚀 **One-Command Build Process** – Easily generate builds for different ad networks.
- ⚡ **Automatic Optimizations** – Includes minification, tree-shaking, and dead code elimination.
- 🎯 **Pre-configured for Major Ad Networks** – Works out of the box with **Google Ads, Meta (Facebook), AppLovin, Unity, IronSource, Vungle, Mintegral, and many more**.
- 🛠️ **Customizable** – Extend the default build pipeline as needed.

### 🔧 Quick Start

#### 1️⃣ Install `@smoud/playable-scripts`

Install the package in your project:

```sh
npm i --save-dev @smoud/playable-scripts
```

#### 2️⃣ Update `package.json`

Modify your `package.json` file to include the following scripts:

```json
"scripts": {
  "dev": "playable-scripts dev",
  "build": "playable-scripts build"
}
```

#### 3️⃣ Run the development server

Start a local development server with live reloading:

```sh
npm run dev
```

#### 4️⃣ Build for a specific ad network

To generate a playable ad ready for an ad network, use the build command:

```sh
npm run build <ad-network>
```

Supported **Ad Networks**:

- `applovin`
- `unity`
- `google`
- `ironsource`
- `facebook`
- `moloco`
- `adcolony`
- `mintegral`
- `vungle`
- `tapjoy`
- `snapchat`
- `tiktok`
- `appreciate`
- `chartboost`
- `pangle`
- `mytarget`
- `liftoff`
- `smadex`
- `adikteev`
- `bigabid`
- `inmobi`

See more details in [`GitHub repository.`](https://github.com/smoudjs/playable-scripts?tab=readme-ov-file#installation)

### Custom Build Pipeline

Before setting up a custom pipeline, consider using `@smoud/playable-scripts`. It provides an API to extend the standard build function and simplifies the process. See more details [here](https://github.com/smoudjs/playable-scripts?tab=readme-ov-file#api-reference).

If you still prefer a fully custom build, you need to manage the following aspects yourself:

#### 1️⃣ Define Required Variables

Your build script should replace or define these variables within the `window` object before the rest of your code executes:

```ts
AD_NETWORK = 'applovin'; // Replace with your target network
AD_PROTOCOL = 'mraid'; // Options: 'mraid', 'dapi', 'none'
GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.example';
APP_STORE_URL = 'https://apps.apple.com/app/id123456789';
BUILD_HASH = 'random-build-hash';
```

#### 2️⃣ Applying Ad-Specific Adjustments

Certain networks use different ad protocols. Ensure that your build includes or removes code based on the network.

Check [Ad Network Resources & Requirements](#Ad-Network-Resources-&-Requirements) for more details.

#### 3️⃣ Minification & Optimization

To ensure the best performance, your build should include a **JavaScript minimizer** to remove unnecessary code.

##### Recommended Tools:

- [Terser](https://github.com/terser/terser) – Best for JS minification.
- [UglifyJS](https://github.com/mishoo/UglifyJS) – Alternative for JS compression.

## SDK API Reference

### Lifecycle management & typical usage

The SDK provides a comprehensive set of functions to manage the playable ad lifecycle. Functions should be called in the following order:

1. **Initialization & Setup**

   ```javascript
   // Initialize SDK (required first call)
   sdk.init((width, height) => {
     // Setup your app with container dimensions
   });
   ```

2. **Listen for needed events**

   #### **RECOMMENDED** events For best user experience

   ```javascript
   sdk.on('resize', (width, height) => {
     // Update game layout on container resize
     game.updateLayout(width, height);
     ui.repositionElements();
   });

   sdk.on('pause', () => {
     // Pause gameplay when ad container loses focus
     game.pauseGameplay();
     ui.showPauseOverlay();
   });

   sdk.on('resume', () => {
     // Resume gameplay when focus returns
     game.resumeGameplay();
     ui.hidePauseOverlay();
   });

   sdk.on('volume', (level) => {
     // Adjust game audio when container volume changes
     audio.setVolume(level);
     ui.updateVolumeIndicator(level);

     //   if (level === 0) audio.muteGlobal();
     //   else audio.unMuteGlobal();
   });

   sdk.on('finish', () => {
     // Show end screen when playable is marked complete
     game.stopGameplay();
     ui.showEndScreen();
   });
   ```

   #### Optional events

   ```javascript
   sdk.on('init', () => {
     // Show loading screen while SDK initializes
     loadingScreen.show();
   });

   sdk.on('ready', () => {
     // You should use either init callback function or this event to initialize your game
     // They are performing just in the same condition, so avoid creating game instance duplication
     new Game(sdk.maxWidth, sdk.maxHeight);
   });

   sdk.on('start', () => {
     // Begin gameplay/animation when playable officially starts
     game.startGameplay();
     loadingScreen.hide();
   });

   sdk.on('interaction', (count) => {
     // Track user engagement
     analytics.logInteraction(count);
     if (count >= 3) {
       // Show CTA after sufficient engagement
       game.showCallToAction();
     }
   });

   sdk.on('retry', () => {
     // Reset game state for replay
     game.reset();
     ui.hideEndScreen();
     game.startGameplay();
   });

   sdk.on('install', () => {
     // Track conversion when install/store action triggered
     analytics.logConversion();
   });
   ```

3. **Mark all resources are preloaded and gameplay is started**

   ```javascript
   // Start playable after resources are loaded
   sdk.start();
   ```

4. **Completion & Installation**

   ```javascript
   // Mark playable as complete
   sdk.finish();
   ```

   ```javascript
   // Trigger install/store redirect
   sdk.install();
   ```

### Event System

Events are emitted throughout the playable lifecycle and can be handled using:

```javascript
// Regular event listener
sdk.on('eventName', callback, [context]);

// One-time event listener
sdk.once('eventName', callback, [context]);

// Remove listener(s)
sdk.off('eventName', [callback], [context]);
```

#### Available Events

| Event         | Parameters      | Description                                       | Typical Usage            |
| ------------- | --------------- | ------------------------------------------------- | ------------------------ |
| `init`        | -               | DOM Content loaded and SDK initialization started | Setup loading screen     |
| `boot`        | -               | Ad container is ready `pre` init callback         | Initialize core systems  |
| `ready`       | -               | Ad container is ready `post` init callback        | Start resource loading   |
| `start`       | -               | Playable experience started                       | Begin gameplay/animation |
| `interaction` | `count`         | User interaction occurred                         | Track engagement         |
| `resize`      | `width, height` | Container size changed                            | Update layout            |
| `pause`       | -               | Playable entered pause state                      | Pause gameplay           |
| `resume`      | -               | Playable resumed from pause                       | Resume gameplay          |
| `volume`      | `level`         | Volume level changed (0-1)                        | Adjust audio             |
| `retry`       | -               | Retry/restart triggered                           | Reset game state         |
| `finish`      | -               | Playable marked as complete                       | Show end screen          |
| `install`     | -               | Install action triggered                          | Track conversion         |

### Properties

| Property           | Type    | Description                                            |
| ------------------ | ------- | ------------------------------------------------------ |
| `sdk.version`      | string  | Current SDK version                                    |
| `sdk.maxWidth`     | number  | Container width in pixels                              |
| `sdk.maxHeight`    | number  | Container height in pixels                             |
| `sdk.isLandscape`  | boolean | Current device orientation state                       |
| `sdk.isReady`      | boolean | Ad container ready state                               |
| `sdk.isStarted`    | boolean | All resources are loaded and playable started state    |
| `sdk.isPaused`     | boolean | Current pause state                                    |
| `sdk.isFinished`   | boolean | Completion state                                       |
| `sdk.volume`       | number  | Default volume level (0-1), when muting/unmuting audio |
| `sdk.interactions` | number  | User interaction count                                 |

## Demo Projects

Get started quickly with our template projects:

- [playable-template-base](https://github.com/smoudjs/playable-template-base) - Clean TypeScript starter with minimal dependencies
- [playable-template-base-js](https://github.com/smoudjs/playable-template-base-js) - Clean JavaScript starter with minimal dependencies
- [playable-template-pixi](https://github.com/smoudjs/playable-template-pixi) - PixiJS template for 2D playable ads
- [playable-template-three](https://github.com/smoudjs/playable-template-three) - Three.js template for 3D playable ads
- [playable-template-phaser](https://github.com/smoudjs/playable-template-phaser) - Phaser template for 2D playable ads

## References

### Ad Network Resources & Requirements

#### MRAID Networks

- [MRAID 3.0](https://www.iab.com/wp-content/uploads/2017/07/MRAID_3.0_FINAL.pdf)
- [IronSource - Interactive ad creative requirements](https://developers.is.com/ironsource-mobile/general/interactive-requirements/#step-1)
- [IronSource - MRAID requirements](https://developers.is.com/ironsource-mobile/general/mraid-requirements/#step-1)
- [IronSource - DAPI requirements](https://developers.is.com/ironsource-mobile/general/dapi-requirements/#step-1)
- [Unity Ads Documentation](https://docs.unity.com/acquire/en-us/manual/playable-ads-specifications)
- [Chartboost Integration](https://docs.chartboost.com/en/advertising/creatives/creative-assets/)
- [Adikteev specifications for external creatives](https://help.adikteev.com/hc/en-us/articles/10549028250130-Specifications-for-external-creatives)

#### Proprietary Networks

- [Google HTML5 / Playable Ads](https://support.google.com/google-ads/answer/9981650?hl=en)
- [Meta (Facebook) Playable Ads](https://www.facebook.com/business/help/412951382532338)
- [Moloco Requirements](https://help.moloco.com/hc/en-us/articles/24124525963799-Playable-and-Interactive-End-Card-IEC-creative-guide)
- [Mintegral Integration](https://www.playturbo.com/review/doc)

### Testing Tools

#### Network Testing Tools

- Applovin Playable [Web](https://p.applov.in/playablePreview?create=1&;qr=1) / [iOS](https://install.appcenter.ms/orgs/iosdeveloper-dbmy/apps/ios-playable-preview/distribution_groups/all-users-of-ios-playable-preview) / [Android](https://install.appcenter.ms/orgs/iosdeveloper-dbmy/apps/android-playable-preview/distribution_groups/all-users-of-android-playable-preview)
- Unity Ad Testing [iOS](https://apps.apple.com/us/app/ad-testing/id1463016906) / [Android](https://play.google.com/store/apps/details?id=com.unity3d.auicreativetestapp)
- [Vungle Creative QA](https://vungle.com/creative-verifier/)
- [Facebook Playable Preview Tool](https://developers.facebook.com/tools/playable-preview/)
- [Google HTML5 Validator](https://h5validator.appspot.com/adwords/asset)
- [IronSource - Submit an HTML asset for review](https://developers.is.com/ironsource-mobile/general/html-upload/)
- [Mintegral Testing Tool](https://www.playturbo.com/review)

## Issues

Report issues at [GitHub Issues](https://github.com/smoudjs/playable-sdk/issues)
