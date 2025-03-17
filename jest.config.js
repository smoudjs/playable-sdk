module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  globals: {
    __NPM_PACKAGE_VERSION__: process.env.npm_package_version,
    AD_NETWORK: "preview",
    AD_PROTOCOL: "none",
    GOOGLE_PLAY_URL: 'https://play.google.com/store/games?device=windows',
    APP_STORE_URL: 'https://www.apple.com/app-store/'
  }
};
