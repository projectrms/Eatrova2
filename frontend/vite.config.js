import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  build: {
    // Increase chunk size warning limit (default 500 KB)
    chunkSizeWarningLimit: 2000, // 2000 KB = 2 MB
  },
})