const isProd = process.env.ENV === 'production'

export default defineNuxtConfig({
  ssr: true,
  devtools: { enabled: true },

  // experiments
  experimental: {
    writeEarlyHints: true
  },

  vite: {
    build: { sourcemap: false }
  },

  routeRules: {
    '/': {
      prerender: true
    }
  },

  app: {
    head: {
      link: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: '/favicon.ico'
        }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  modules: ['@nuxt/ui', '@vueuse/nuxt'],

  typescript: {
    tsConfig: {
      exclude: ['../functions']
    }
  },

  colorMode: {
    preference: 'light',
    fallback: 'light'
  },

  ui: {
    // icons: [
    //   'heroicons'
    //   // list more icon sets here
    // ]
  },

  // turn off tailwind viewer to make dev build a bit faster - we hardly use it
  tailwindcss: {
    viewer: false
  },

  compatibilityDate: '2024-09-26'
})
