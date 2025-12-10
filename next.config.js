/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable untuk production dengan HTTPS
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Permissions-Policy",
            value: "camera=*, microphone=*",
          },
        ],
      },
    ];
  },
  // Turbopack config (Next.js 16+)
  turbopack: {},
  
  // Webpack config untuk handle MediaPipe (hanya di client-side)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    
    // Exclude MediaPipe dari server-side bundle
    if (isServer) {
      config.externals = [...(config.externals || []), '@mediapipe/pose'];
    }
    
    return config;
  },
};

module.exports = nextConfig;
