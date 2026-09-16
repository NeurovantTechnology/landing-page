import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    watch: {
      ignored: ['**/.qa-*/**'],
    },
  },
  build: {
    target: 'es2020',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: 'index.html',
        neurofit: 'projects/neurofit/index.html',
      },
    },
  },
});
