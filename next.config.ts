import path from 'path';
import process from 'process';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import type { NextConfig } from 'next';
import type { Configuration } from 'webpack';
import webpack from 'webpack';

const pathBuilder = (subpath: string): string => path.join(process.cwd(), subpath);


const nextConfig: NextConfig = {
  reactStrictMode: false, 
  eslint: {
    ignoreDuringBuilds: true,
  },
  /* config options here */
  // experimental: {
  //   staleTimes: {
  //     dynamic:30,
  //   },
  // },
  experimental: {
    serverActions: {
      bodySizeLimit: '100000mb',
    },
  },

  images: {
    remotePatterns: [
          // local dev
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },

      {
        protocol: 'https',
        // Allow all AWS S3 subdomains (e.g., your-bucket.s3.us-east-1.amazonaws.com)
        hostname: '**.amazonaws.com', 
      },
    ],
  },
  
  webpack: (config: Configuration, { isServer }) => {
      config.resolve = {
        ...config.resolve,
      };
    if (!isServer) {
      // 1. Define Cesium Base URL ONCE
      config.plugins!.push(
        new webpack.DefinePlugin({
          CESIUM_BASE_URL: JSON.stringify("/cesium"),
        })
      );

      // 2. Copy Cesium Assets to /public/cesium
      config.plugins!.push(
        new CopyWebpackPlugin({
          patterns: [
            {
              from: path.join(process.cwd(), "node_modules/cesium/Build/Cesium"),
              to: path.join(process.cwd(), "public/cesium"),
            },
          ],
        })
      );

      // 3. Fix Cesium Engine alias
      // config.resolve!.alias = {
      //   ...config.resolve!.alias,
      //   "@cesium/engine": path.resolve(
      //     process.cwd(),
      //     "node_modules/@cesium/engine/Source"
      //   ),
      // };
    }

    return config;
  },

//   webpack: (config: Configuration, { webpack , isServer }) => {

//         if (!isServer) {
//             // Define CESIUM_BASE_URL first
//             config.plugins!.push(
//                 new webpack.DefinePlugin({
//                     CESIUM_BASE_URL: JSON.stringify('/cesium')
//                 })
//             );


//         config.plugins!.push(
//             new CopyWebpackPlugin({
//                 patterns: [
//                     {
//                         from: pathBuilder('node_modules/cesium/Build/Cesium/Workers'),
//                         to: '../public/cesium/Workers',
//                         info: { minimized: true }
//                     }
//                 ]
//             }),
//             new CopyWebpackPlugin({
//                 patterns: [
//                     {
//                         from: pathBuilder('node_modules/cesium/Build/Cesium/ThirdParty'),
//                         to: '../public/cesium/ThirdParty',
//                         info: { minimized: true }
//                     }
//                 ]
//             }),
//             new CopyWebpackPlugin({
//                 patterns: [
//                     {
//                         from: pathBuilder('node_modules/cesium/Build/Cesium/Assets'),
//                         to: '../public/cesium/Assets',
//                         info: { minimized: true }
//                     }
//                 ]
//             }),
//             new CopyWebpackPlugin({
//                 patterns: [
//                     {
//                         from: pathBuilder('node_modules/cesium/Build/Cesium/Widgets'),
//                         to: '../public/cesium/Widgets',
//                         info: { minimized: true }
//                     }
//                 ]
//             }),
//             new webpack.DefinePlugin({ CESIUM_BASE_URL: JSON.stringify('/cesium') })
//         );


//             // Fix module resolution
//             config.resolve!.alias = {
//                 ...config.resolve!.alias,
//                 '@cesium/engine': path.resolve(__dirname, 'node_modules/@cesium/engine/Source')
//             };
            
//         }

//         return config;
//     },
  // reactStrictMode: true,
  // webpack: (
  //   config: Configuration,
  //   { isServer }: { isServer: boolean }
  // ) => {
  //   config.plugins?.push(
  //     new webpack.DefinePlugin({
  //       CESIUM_BASE_URL: JSON.stringify('cesium'),
  //     })
  //   );
  //   return config;
  // },
};

export default nextConfig;

