import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  server: {
    host: '127.0.0.1', // IPv4 expliciet, zodat k6/Postman (vaak 127.0.0.1) geen "connection refused" krijgen
    port: 3000
  }
});
