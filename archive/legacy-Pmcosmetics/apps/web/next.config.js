/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['s3.amazonaws.com', 'pmcosmetics.s3.amazonaws.com', 'via.placeholder.com'],
  },
  i18n: {
    locales: ['ar', 'en'],
    defaultLocale: 'ar',
  },
};

module.exports = nextConfig;
