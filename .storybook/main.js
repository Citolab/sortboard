// module.exports = {
//   stories: [],
//   addons: ['@storybook/addon-knobs/register'],
// };

const path = require('path');

module.exports = {
  stories: [],
  addons: [
    {
      name: '@storybook/addon-essentials',
      options: {
        controls: false,
      }
    },
    '@storybook/addon-links',
    '@storybook/addon-knobs',
    '@storybook/addon-storysource',
  ],

  webpackFinal: async (config, { configType }) => {
    // `configType` has a value of 'DEVELOPMENT' or 'PRODUCTION'
    // You can change the configuration based on that.
    // 'PRODUCTION' is used when building the static version of storybook.

    // Make whatever fine-grained changes you need
    config.module.rules.push({
      test: /\.scss$/,
      use: ['style-loader', 'css-loader', 'sass-loader'],
      include: path.resolve(__dirname, '../'),
    });

    // Return the altered config
    return config;
  },
};