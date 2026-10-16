import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Vite 配置：React 插件 + Tailwind CSS v4 官方 Vite 插件（新范式，无 PostCSS/config 文件）
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    // Vitest 配置与 Vite 共用一份文件，避免 jsdom 环境配置漂移
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: false,
  },
})
