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
};

module.exports = nextConfig;
