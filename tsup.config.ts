import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs', 'iife'],
  outDir: 'dist',
  legacyOutput: true,
  dts: true,
  clean: true,
  define: {
    __NPM_PACKAGE_VERSION__: JSON.stringify(process.env.npm_package_version)
  }
});
