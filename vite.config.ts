// web/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/grape-reverse/', // ← GitHub Pages（Project Pages）用のベースパス
  plugins: [react()],
})