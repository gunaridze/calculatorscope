import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Включаем source maps для production (чтобы в DevTools код был читаемым)
  productionBrowserSourceMaps: true,
  
  // Rewrites для apple-touch-icon файлов через API route
  // Это может помочь, если статические файлы защищены паролем
  async rewrites() {
    return [
      {
        source: '/apple-touch-icon.png',
        destination: '/api/apple-touch-icon?size=180',
      },
      {
        source: '/apple-touch-icon-:size(\\d+).png',
        destination: '/api/apple-touch-icon?size=:size',
      },
    ];
  },
  
  // Опционально: можно также настроить минификацию
  // swcMinify: true, // Next.js использует SWC по умолчанию
};

export default nextConfig;