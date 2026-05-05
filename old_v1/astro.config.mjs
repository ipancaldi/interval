import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://interval.studio',
  output: 'static',
  build: {
    format: 'directory',
  },
  trailingSlash: 'ignore',
  compressHTML: true,
});
