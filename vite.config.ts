import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 'prompt' (not 'autoUpdate') so a new deploy surfaces an explicit
      // "new version available" banner the user taps to reload — reliable on
      // iOS, where silent auto-update often leaves the old assets running.
      registerType: 'prompt',
      // Don't let the SW's navigation fallback hijack Firebase Auth's reserved
      // /__/auth/* routes (served same-origin via the vercel.json proxy) — otherwise
      // the OAuth handler would render the app shell and sign-in would silently fail.
      workbox: { navigateFallbackDenylist: [/^\/__\//] },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Gym Tracker PWA',
        short_name: 'Gym',
        description: 'Advanced Minimalist Gym Tracker',
        theme_color: '#000000',
        background_color: '#09090b',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
});
