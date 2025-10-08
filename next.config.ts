import path from 'path';
import process from 'process';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import type { NextConfig } from 'next';
import type { Configuration } from 'webpack';

const pathBuilder = (subpath: string): string => path.join(process.cwd(), subpath);


const nextConfig: NextConfig = {
  /* config options here */
  // experimental: {
  //   staleTimes: {
  //     dynamic:30,
  //   },
  // },
  experimental: {
    serverActions: {
      bodySizeLimit: '1000mb',
    },
  },

  webpack: (config: Configuration, { webpack , isServer }) => {

        if (!isServer) {
            // Define CESIUM_BASE_URL first
            config.plugins!.push(
                new webpack.DefinePlugin({
                    CESIUM_BASE_URL: JSON.stringify('/cesium')
                })
            );


        config.plugins!.push(
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: pathBuilder('node_modules/cesium/Build/Cesium/Workers'),
                        to: '../public/cesium/Workers',
                        info: { minimized: true }
                    }
                ]
            }),
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: pathBuilder('node_modules/cesium/Build/Cesium/ThirdParty'),
                        to: '../public/cesium/ThirdParty',
                        info: { minimized: true }
                    }
                ]
            }),
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: pathBuilder('node_modules/cesium/Build/Cesium/Assets'),
                        to: '../public/cesium/Assets',
                        info: { minimized: true }
                    }
                ]
            }),
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: pathBuilder('node_modules/cesium/Build/Cesium/Widgets'),
                        to: '../public/cesium/Widgets',
                        info: { minimized: true }
                    }
                ]
            }),
            new webpack.DefinePlugin({ CESIUM_BASE_URL: JSON.stringify('/cesium') })
        );


            // Fix module resolution
            config.resolve!.alias = {
                ...config.resolve!.alias,
                '@cesium/engine': path.resolve(__dirname, 'node_modules/@cesium/engine/Source')
            };
            
        }

        return config;
    }
};

export default nextConfig;

