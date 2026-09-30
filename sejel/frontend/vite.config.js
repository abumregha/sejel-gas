import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      // Wizard endpoint: nginx rewrites this in production (see /etc/nginx/sites-enabled/sejel)
      '/api/setup-station': {
        target: 'http://127.0.0.1:8002',
        changeOrigin: true,
        rewrite: () => '/api/method/sejel_app.api.views.setup_station',
      },
      '/api': {
        target: 'http://127.0.0.1:8002',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: '../staticfiles/vue',
    emptyOutDir: true,
  },
})
