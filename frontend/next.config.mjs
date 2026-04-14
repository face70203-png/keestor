/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
       { protocol: 'http', hostname: 'localhost' },
       { protocol: 'https', hostname: 'plus.unsplash.com' },
       { protocol: 'https', hostname: 'images.unsplash.com' },
       { protocol: 'https', hostname: 'res.cloudinary.com' }
    ],
  },
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
