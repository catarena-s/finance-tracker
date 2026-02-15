/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  },
  // Оптимизация code splitting
  experimental: {
    optimizePackageImports: ['@/components/ui', '@/components/dashboard'],
  },
  // Настройка webpack для лучшего splitting
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Выделяем большие библиотеки в отдельные чанки
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
              return `npm.${packageName.replace('@', '')}`;
            },
            priority: 10,
          },
          // Общие компоненты
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 5,
          },
        },
      };
    }
    return config;
  },
}

module.exports = nextConfig
