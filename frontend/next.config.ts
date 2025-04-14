import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://student-job-tracker-backend-9dmx.onrender.com/api/:path*',
      },
    ];
  },
};

export default nextConfig;
