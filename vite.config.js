import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base must match the GitHub repository name for GitHub Pages to serve assets correctly
export default defineConfig({
  plugins: [react()],
  base: '/task-manager-react-client/',
})
