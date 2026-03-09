import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const apiUrl = process.env.VITE_API_URL || 'http://localhost:6018';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5018,
    strictPort: true,
    proxy: {
      '/api': { target: apiUrl, changeOrigin: true },
      '/health': { target: apiUrl, changeOrigin: true },
    },
  },
});
