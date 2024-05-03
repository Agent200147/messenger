/*/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    // logging: {
    //     fetches: {
    //         fullUrl: true
    //     }
    // },
    // experimental: {
    //     staleTimes: {
    //         dynamic: 10,
    //         static: 60
    //     }
    // },

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

            {
                protocol: 'http',
                hostname: 'localhost',
                port: '8000',
                pathname: '/canvas/**',
            },
        ],
    },
};

export default nextConfig;
