import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',  // Stream SDK fix
  },
  optimizeDeps: {
    include: [
      '@stream-io/video-react-sdk',
      '@stream-io/video-client',
      'react', 'react-dom'
    ]
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/]
    },
    rollupOptions: {
      output: {
        manualChunks: {
          stream: ['@stream-io/video-react-sdk']
        }
      }
    }
  }
})
