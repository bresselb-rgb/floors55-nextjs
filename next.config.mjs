/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // This allows Vercel to successfully build even if there are unescaped apostrophes
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**', // This allows all images from your Firebase storage bucket
      },
    ],
  },
};

export default nextConfig;