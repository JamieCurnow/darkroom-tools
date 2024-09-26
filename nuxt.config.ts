// https://nuxt.com/docs/api/configuration/nuxt-config

/** Defaults to 1 year on the edge and 5 mins on the client */
const _edgeCache = (seconds: number = 31536000) => ({
  headers: { 'Cache-Control': `max-age=300, s-maxage=${seconds}` }
})
/** Defaults to 1 hr */
const _clientCache = (seconds: number = 3600) => ({
  headers: { 'Cache-Control': `max-age=${seconds}, s-maxage=0` }
})

const isProd = process.env.ENV === 'production'

export default defineNuxtConfig({
  ssr: true,
  devtools: { enabled: true },
  extends: ['@hiyield/nuxt-layer-firebase', '@hiyield/nuxt-layer-firebase-auth'],

  // experiments
  experimental: {
    writeEarlyHints: true
  },

  vite: {
    build: { sourcemap: isProd }
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

  // nuxt security module settings
  security: {
    headers: {
      // relax referer policy to make vimeo embeds work
      referrerPolicy: 'no-referrer-when-downgrade',
      // make nuxt dev tools work
      crossOriginEmbedderPolicy: 'unsafe-none',
      contentSecurityPolicy: {
        'img-src': [
          "'self'",
          'data:',
          'blob:'
          // allow all external images if needed:
          // '*'
        ]
      }
    }
  },

  /** Example route rules */
  routeRules: {
    /**
     * Pre-render rules need to be absolute paths - no wildcards.
     * see: https://github.com/unjs/nitro/issues/1856
     */
    // '/pre-render-me': { prerender: true },
    /** edgeCache() will tell firebase to cache at the edge cdn */
    // '/blog/**': edgeCache(),
    // '/edge-cache': edgeCache(),
    /** clientCache() will not cache at the edge, but will cache client side */
    // '/client-cache': clientCache()
  },

  modules: ['nuxt-doppler', '@nuxt/ui', 'nuxt-security', '@vueuse/nuxt', '@nuxt/eslint'],

  doppler: {
    serviceToken: process.env.DOPPLER_SERVICE_TOKEN,
    project: '<your_doppler_project_id>',
    config: process.env.ENV
  },

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
  }
})
