import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["arcjet", "@arcjet/next", "@arcjet/analyze"],
  images:{
    remotePatterns:[
      {
        hostname: "avatars.githubusercontent.com",
        protocol: "https"
      },
      {
        hostname:"avatar.vercel.sh",
        protocol:"https"
      },{
        hostname:"cqaudhsqdi.ufs.sh",
        protocol:"https"
      }
    ]
  }
};

export default nextConfig;
