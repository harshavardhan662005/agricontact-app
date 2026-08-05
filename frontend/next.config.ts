/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Required for static exports on GitHub Pages
  },
};

module.exports = nextConfig;