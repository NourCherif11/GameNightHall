import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/gameparksousse/', // Must match your GitHub repo name exactly!
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
