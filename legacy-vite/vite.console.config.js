import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Second app: the internal Admin/Developer console, served on its own port and
// built to its own output dir so it can be deployed separately from the
// consumer marketplace. Shares the same src/ (context, data, components, pages).
export default defineConfig({
  plugins: [react()],
  server: { host: true, port: 5174, open: '/console.html' },
  preview: { host: true, port: 4174 },
  build: {
    outDir: 'dist-console',
    emptyOutDir: true,
    rollupOptions: { input: 'console.html' },
  },
})
