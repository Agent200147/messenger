/*/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    logging: {
        fetches: {
            fullUrl: true
        }
    },
    env: {
        SERVER_URL: 'http://localhost:8000',
        API_URL: 'http://localhost:8000/api',
        SOCKET_URL: 'http://localhost:8001'
    },
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '8000',
                pathname: '/userAvatarPhotos/**',
            },
        ],
    },
};

export default nextConfig;
