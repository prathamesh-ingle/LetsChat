import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',  // ✅ Production path
  define: { global: 'globalThis' },
  optimizeDeps: { include: ['@stream-io/video-react-sdk'] },
  build: {
    rollupOptions: {
      output: { manualChunks: { video: ['@stream-io/video-react-sdk'] } }
    }
  }
})
