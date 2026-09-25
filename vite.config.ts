import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { resolve } from 'path'
import { copyFileSync } from 'fs'

/**
 * GitHub Pages — статический хостинг без SPA-фолбэка: для пути, которому не соответствует
 * файл, он отдаёт 404.html. Кладём туда копию index.html, иначе прямой заход на /skill/:id
 * или обновление любой внутренней страницы вернёт ошибку вместо приложения.
 */
function spaFallback() {
  return {
    name: 'spa-404-fallback',
    apply: 'build' as const,
    closeBundle() {
      const dist = resolve(__dirname, 'dist')
      copyFileSync(resolve(dist, 'index.html'), resolve(dist, '404.html'))
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: '/SkillSwap/',
  plugins: [
    react(),
    svgr(),
    spaFallback(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
