import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'منصة رعاية عروب',
        short_name: 'عروب',
        description: 'منصة متابعة الرعاية المنزلية لعروب',
        lang: 'ar',
        dir: 'rtl',
        theme_color: '#e85d8a',
        background_color: '#fff7fa',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: 'icon-512.svg', sizes: '512x512', type: 'image/svg+xml' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        runtimeCaching: [
          {
            urlPattern: /\/api\//,
            handler: 'NetworkFirst',
            options: { cacheName: 'api-cache', networkTimeoutSeconds: 5 },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  // @arob/shared is a workspace-local CommonJS package (it must stay require()-able
  // from the plain-Node API build too). Pre-bundling it with esbuild here converts
  // its `export *` re-exports to ESM before Rollup sees it — Rollup's own commonjs
  // plugin cannot statically resolve those star re-exports on its own.
  optimizeDeps: {
    include: ['@arob/shared'],
  },
  resolve: {
    // npm workspaces symlinks @arob/shared in from packages/shared, which lives
    // outside node_modules. Without this, Vite resolves the symlink to its real
    // path and stops treating the package as a node_modules dependency, so the
    // CommonJS interop step (needed for its dist/index.js) never runs.
    preserveSymlinks: true,
  },
});
