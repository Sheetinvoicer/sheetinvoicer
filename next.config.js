/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  
  i18n: {
    locales: ['en', 'es', 'fr', 'ar'],
    defaultLocale: 'en',
    localeDetection: true,
  },
  
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig
