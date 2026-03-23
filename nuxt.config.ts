// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  app: {
    head: {
      title: 'Sunday Badminton — Quản lý đội cầu lông',
      meta: [
        { name: 'theme-color', content: '#16a34a' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      ],
      link: [
        { rel: 'apple-touch-icon', href: '/icon-512x512.png' },
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  modules: ['@nuxt/ui', '@nuxtjs/supabase', '@vite-pwa/nuxt'],

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Sunday Badminton — Quản lý đội cầu lông',
      short_name: 'Sunday Badminton',
      description: 'Quản lý đội cầu lông: điểm danh, chia phí, theo dõi tài chính',
      theme_color: '#16a34a',
      background_color: '#f5f6f7',
      display: 'standalone',
      orientation: 'portrait',
      icons: [
        {
          src: '/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    devOptions: {
      enabled: false,
    },
  },

  supabase: {
    redirect: false,
  },

  colorMode: {
    preference: 'light',
    fallback: 'light',
    classSuffix: '',
  },

  runtimeConfig: {
    public: {
      appName: 'Sunday Badminton Team',
    },
  },
})
