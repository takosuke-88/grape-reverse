// web/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/', // ← 独自ドメイン（grape-reverse.com）用のベースパス
  plugins: [react()],
})