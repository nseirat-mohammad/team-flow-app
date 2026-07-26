import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["arcjet", "@arcjet/next", "@arcjet/analyze"],
};

export default nextConfig;
