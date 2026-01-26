import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    resolve: {
      extensions: ['.js', '.ts']
    },
    build: {
      lib: {
        entry: 'electron/main/index.ts'
      },
      rollupOptions: {
        external: ['express', 'path', 'cookie-parser', 'express-session', 'cors', 'dotenv', 'bcryptjs', 'jsonwebtoken', 'formidable', 'mongoose']
      }
    }
  },
  preload: {
    build: {
      lib: {
        entry: 'electron/preload/index.ts'
      }
    }
  },
  renderer: {
    root: 'renderer',
    publicDir: 'renderer/public',
    server: {
      port: 3000
    },
    resolve: {
      alias: {
        '@': resolve('renderer/src'),
        '@components': resolve('renderer/src/components'),
        '@hooks': resolve('renderer/src/hooks'),
        '@pages': resolve('renderer/src/pages'),
        '@services': resolve('renderer/src/services'),
        '@stores': resolve('renderer/src/stores'),
        '@utils': resolve('renderer/src/utils'),
        '@assets': resolve('renderer/src/assets'),
        '@styles': resolve('renderer/src/styles')
      }
    },
    plugins: [react()],
    build: {
      rollupOptions: {
        input: {
          main: resolve('renderer/index.html')
        }
      }
    }
  }
})
