/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: "/usdc-demo",
  assetPrefix: "/usdc-demo",
}

module.exports = nextConfig 