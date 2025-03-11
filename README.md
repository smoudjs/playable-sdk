# Playable SDK

The package contains sdk core functions, to allow run playable ads in the applovin, unity or any other ad network.

Currently supports:

- applovin
- unity
- google
- ironsource mraid / dapi
- facebook
- moloco
- mintegral
- vungle
- adcolony
- tapjoy
- snapchat
- tiktok
- appreciate
- chartboost
- pangle
- mytarget
- liftoff


## Documentation

Documentation can be found here: [documentation](https://github.com/smoudjs/playable-sdk)

## Installation

```bash
npm install @smoud/playable-sdk
```

## Usage

```ts
import { sdk } from '@smoud/playable-sdk';
import { Game } from './Game';

sdk.init((width, height) => {
  const game = new Game(width, height);

  sdk.on('resize', game.resize, game);
  sdk.on('pause', game.pause, game);
  sdk.on('resume', game.resume, game);
  sdk.on('finish', game.finish, game);
});
```



Resources, other ad networks requirements
https://www.playturbo.com/review/doc
https://docs.chartboost.com/en/advertising/creatives/mraid-playable/
https://doc.playturbo.com/other-tutorials/documentation-for-project-deployment/playable-upload-specifications-for-networks
https://www.iab.com/guidelines/mraid/
https://iabtechlab.com/wp-content/uploads/2018/06/MRAID_3.0_FINAL_June_2018.pdf