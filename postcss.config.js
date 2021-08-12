module.exports = {
  plugins: [
    // tailwindcss: {},
    // autoprefixer: {},
    require('postcss-import'),
    require('tailwindcss')('./tailwind.config.js'),
    require('postcss-100vh-fix'),
    require('autoprefixer'),
  ],
};
