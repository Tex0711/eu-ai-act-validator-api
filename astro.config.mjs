import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import node from '@astrojs/node';
import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
// On Vercel: use Vercel adapter. In CI/local: use Node adapter (dist/server/entry.mjs).
export default defineConfig({
  integrations: [tailwind(), react()],
  output: 'server',
  site: 'https://compliancecode.eu',
  adapter: process.env.VERCEL ? vercel() : node({ mode: 'standalone' }),
  server: {
    host: '127.0.0.1',
    port: 3000
  }
});
