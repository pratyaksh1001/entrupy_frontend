/** @type {import('next').NextConfig} */
const nextConfig = {
    allowedDevOrigins: [
        "local-origin.dev",
        "*.local-origin.dev",
        "localhost",
        "127.0.0.1",
    ],
};

export default nextConfig;
