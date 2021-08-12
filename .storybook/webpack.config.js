/**
 * Export a function. Accept the base config as the only param.
 * @param {Object} options
 * @param {Required<import('webpack').Configuration>} options.config
 * @param {'DEVELOPMENT' | 'PRODUCTION'} options.mode - change the build configuration. 'PRODUCTION' is used when building the static version of storybook.
 */
const tailwindWebpackRule = {
  test: /\.scss$/,
  loader: 'postcss-loader',
};

module.exports = async ({ config, mode }) => {

  // PK: https://github.com/nrwl/nx/issues/3480#issuecomment-695773946
  // Using the same tailwind rules as we used to get tailwind working in our react app
  // see READMETAILWIND.md
  config = {
    ...config,
    plugins: [
      ...config.plugins,
    ],
    module: {
      rules: [
        ...config.module.rules,
        tailwindWebpackRule
      ],
    },
  };

  // Return the altered config
  return config;
};
