import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  output: 'static',
  site: 'https://compliancecode.eu',
  server: {
    host: '127.0.0.1',
    port: 3000
  }
});
