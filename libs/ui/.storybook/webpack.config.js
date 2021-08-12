const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const rootWebpackConfig = require('../../../.storybook/webpack.config');
// Export a function. Accept the base config as the only param.
module.exports = async ({ config, mode }) => {
    config = await rootWebpackConfig({ config, mode });

    const tsPaths = new TsconfigPathsPlugin({
      configFile: './tsconfig.base.json',
       });
    
      config.resolve.plugins
        ? config.resolve.plugins.push(tsPaths)
        : (config.resolve.plugins = [tsPaths]);
      
    config.resolve.extensions.push('.tsx');
    config.resolve.extensions.push('.ts');

    const svgRuleIndex = config.module.rules.findIndex((rule) => {
      const { test } = rule;
  
      return test.toString().startsWith('/\\.(svg|ico');
    });
    config.module.rules[
      svgRuleIndex
    ].test = /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|cur|ani|pdf)(\?.*)?$/;
  
    config.module.rules.push( {
      test: /\.(png|jpe?g|gif|webp)$/,
      loader: require.resolve('url-loader'),
      options: {
        limit: 10000, // 10kB
        name: '[name].[hash:7].[ext]',
      },
    },
    {
      test: /\.svg$/,
      oneOf: [
        // If coming from JS/TS file, then transform into React component using SVGR.
        {
          issuer: {
            test: /\.[jt]sx?$/,
          },
          use: [
            '@svgr/webpack?-svgo,+titleProp,+ref![path]',
            {
              loader: require.resolve('url-loader'),
              options: {
                limit: 10000, // 10kB
                name: '[name].[hash:7].[ext]',
                esModule: false,
              },
            },
          ],
        },
        // Fallback to plain URL loader.
        {
          use: [
            {
              loader: require.resolve('url-loader'),
              options: {
                limit: 10000, // 10kB
                name: '[name].[hash:7].[ext]',
              },
            },
          ],
        }]
      },
        {
        test: /\.(ts|tsx)$/,
        loader: require.resolve('babel-loader'),
        options: {
            presets: [
                '@babel/preset-env',
                '@babel/preset-react',
                '@babel/preset-typescript',                                           
            ],
            "plugins": [
                ["@babel/plugin-proposal-decorators", { "legacy": true }],
                ["@babel/plugin-proposal-class-properties", { "loose" : true }]
              ],          
        },
       
    });
    // This is needed for "@storybook/addon-storysource.
    // Without this story source code won't show in storybook.
    config.module.rules.push({
        test: /\.stories\.(ts|tsx)?$/,        
        loaders: [
            require.resolve('@storybook/source-loader'),            
          ],
        enforce: 'pre',
    });

    return config;
};