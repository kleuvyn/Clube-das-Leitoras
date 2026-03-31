import nextPWA from 'next-pwa';
import runtimeCaching from 'next-pwa/cache.js';

const withPWA = nextPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    // API routes: tentar a rede primeiro, fallback no cache
    {
      urlPattern: /\/api\/.*$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 minutos
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // Imagens estáticas e de conteúdo: stale-while-revalidate
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|webp|gif|avif)$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'image-cache',
        expiration: {
          maxEntries: 150,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    ...runtimeCaching,
  ],
  buildExcludes: [/middleware-manifest\.json$/],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {},
};

export default withPWA(nextConfig);
