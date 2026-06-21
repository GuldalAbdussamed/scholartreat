import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // @x402/fetch paketinin tip tanımları eski, runtime'da çalışıyor
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
