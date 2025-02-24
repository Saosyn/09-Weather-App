import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist', // ✅ Ensures output goes to dist/
    assetsDir: 'assets', // ✅ Stores CSS/JS in /assets/
    cssCodeSplit: false, // ✅ Prevents splitting CSS into multiple files
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name][extname]', // ✅ Keeps filenames stable (no hashes)
      },
    },
  },
});
