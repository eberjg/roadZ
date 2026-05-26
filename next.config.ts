import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["mapbox-gl"],
  allowedDevOrigins: ["192.168.0.52"],
};

export default nextConfig;
