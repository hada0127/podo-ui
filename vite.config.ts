import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vike from 'vike/plugin'
import path from 'path'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    vike()
  ],
  server: {
    port: 5432,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // 소스 파일을 직접 참조 (개발: HMR, 프로덕션: 로컬 빌드)
      'podo-ui': path.resolve(__dirname, './index.ts'),
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
}))
