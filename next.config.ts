import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    allowedDevOrigins: [`${process.env.WEBHOOK_DOMAIN}`], // 너의 ngrok 주소
  },
};

export default nextConfig;
