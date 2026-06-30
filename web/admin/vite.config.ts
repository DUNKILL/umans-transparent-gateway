import { defineConfig } from 'vite';

export default defineConfig({
  base: '/admin/',
  build: {
    outDir: '../../internal/gateway/admin_dist',
    emptyOutDir: true,
  },
});
