/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**', 
      },
    ],
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes in your application
        source: '/(.*)',
        headers: [
          {
            // Prevents your site from being loaded inside an iframe (Clickjacking mitigation)
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            // Forces browsers to use HTTPS (HSTS policy)
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            // Prevents browsers from guessing the content type
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            // Cross-Origin-Opener-Policy (COOP)
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          }
        ],
      },
    ];
  },
};

export default nextConfig;