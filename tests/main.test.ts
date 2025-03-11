import sdk from '../src';

class App {
  public isReady: boolean = false;
  public isFinished: boolean = false;
  public isPaused: boolean = false;
  public width: number = 0;
  public height: number = 0;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;

    sdk.on('resize', this.resize, this);
    sdk.on('finish', this.finish, this);
    sdk.on('pause', this.pause, this);
    sdk.on('resume', this.resume, this);

    this.create();
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }

  create() {
    this.isReady = true;
    sdk.start();
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  finish() {
    this.isFinished = true;
  }
}

const nextFrame = () => new Promise((resolve) => setTimeout(resolve, 0));
window.open = () => null;

let app: App;

sdk.init((width: number, height: number) => {
  app = new App(width, height);
});

beforeAll(async () => {
  if (!sdk.isReady) {
    await new Promise((resolve) => {
      sdk.on('ready', resolve);
    });
  }
});

test('SDK initialized correctly', async () => {
  await nextFrame();

  let isInstaled = false;
  sdk.on('install', () => {
    isInstaled = true;
  });

  expect(app.isReady).toBe(true);
  expect(app.width).not.toBe(0);
  expect(app.height).not.toBe(0);

  global.innerHeight = 640;
  global.innerWidth = 320;
  global.dispatchEvent(new Event('resize'));

  await nextFrame();

  expect(app.width).toBe(320);
  expect(app.height).toBe(640);

  sdk.pause();
  await nextFrame();
  expect(app.isPaused).toBe(true);
  sdk.resume();
  await nextFrame();
  expect(app.isPaused).toBe(false);

  sdk.finish();
  expect(app.isFinished).toBe(true);

  sdk.install();
  expect(isInstaled).toBe(true);
});
