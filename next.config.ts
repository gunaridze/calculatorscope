import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Включаем source maps для production (чтобы в DevTools код был читаемым)
  productionBrowserSourceMaps: true,
  
  // Опционально: можно также настроить минификацию
  // swcMinify: true, // Next.js использует SWC по умолчанию
};

export default nextConfig;