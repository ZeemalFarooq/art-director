import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["172.25.64.1", "localhost:3000", "192.168.0.109"],
};

export default nextConfig;