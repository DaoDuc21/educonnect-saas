/** @type {import('next').NextConfig} */
const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';

const nextConfig = {
  // Use static export for GitHub Actions / GitHub Pages; use standalone for Docker and self-hosted server
  output: isGitHubActions ? 'export' : (process.env.NEXT_OUTPUT || 'standalone'),
  basePath: isGitHubActions ? '/educonnect-saas' : (process.env.NEXT_PUBLIC_BASE_PATH || ''),
  assetPrefix: isGitHubActions ? '/educonnect-saas/' : undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
