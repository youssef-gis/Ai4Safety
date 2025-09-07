import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // experimental: {
  //   staleTimes: {
  //     dynamic:30,
  //   },
  // },
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },

};

export default nextConfig;
