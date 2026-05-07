import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://k8s-realtime-realtime-88ceff4f5e-581866777.ap-south-1.elb.amazonaws.com',
        changeOrigin: true,
      },
    },
  },
})
