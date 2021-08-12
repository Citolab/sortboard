const nrwlConfig = require('@nrwl/react/plugins/webpack.js');

module.exports = (config) => {
  nrwlConfig(config);
  return {
    ...config,
    plugins: [...config.plugins],
    module: {
      rules: [
        ...config.module.rules,
        {
          test: /\.scss$/,
          loader: 'postcss-loader',
          options: {
            postcssOptions : {
            plugins: {
              tailwindcss: {},
              autoprefixer: {},
              // require('postcss-import'),
              // require('tailwindcss')('./tailwind.config.js'),
              // require('autoprefixer'),
            },
          },
          },
        },
      ],
    },
  };
};