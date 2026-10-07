import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://agriadvisor-ai-3f1h.onrender.com/api/v1',
        changeOrigin: true,
      },
    },
  },
});
