/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['hnswlib-node', 'puppeteer'],
  },
};

module.exports = nextConfig;
