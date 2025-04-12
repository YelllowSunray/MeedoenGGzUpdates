/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Disable error page static generation
  experimental: {
    staticPagesDir: [
      {
        path: '_not-found',
        enabled: false,
      },
    ],
  },
};

module.exports = nextConfig; 