import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    fs: {
      allow: ['..'], // Permite acceder al directorio padre (donde está node_modules)
    },
  },
});
