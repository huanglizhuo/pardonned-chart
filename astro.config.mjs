import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'static',
  adapter: cloudflare({ session: false, imageService: 'compile' }),
  integrations: [react(), tailwind()],
});
