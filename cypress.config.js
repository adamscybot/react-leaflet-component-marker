import { defineConfig } from 'cypress'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  component: {
    specPattern: 'cypress/specs/**/*.cy.*',
    viewportHeight: 1080,
    viewportWidth: 1080,
    devServer: {
      framework: 'react',
      bundler: 'vite',
      viteConfig: {
        plugins: [react()],
      },
    },
  },
})
