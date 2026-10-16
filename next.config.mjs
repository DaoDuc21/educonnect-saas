/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'export',
  basePath: isProd ? '/educonnect-saas' : '',
  assetPrefix: isProd ? '/educonnect-saas/' : '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
