const colors = require('tailwindcss/colors')

module.exports = {
  // mode: 'jit',
  future: {
    // removeDeprecatedGapUtilities: true,
    // purgeLayersByDefault: true,
  },
  purge: {
    // enabled: process.env.NODE_ENV === 'production',
    // PK: This enabled should not be necessary if only NX did set NODE_ENV=production
    // When doing production https://github.com/nrwl/nx/issues/3610
    // enabled: true,
    mode: 'all',
    preserveHtmlElements: false,
    content: [
      './apps/**/*.{js,ts,jsx,tsx,html,scss}',
      './libs/**/*.{js,ts,jsx,tsx,html,scss}',
    ],
    // PurgeCSS options
    // Reference: https://purgecss.com/
    options: {
      rejected: true,
      printRejected: true,
      whitelistPatterns: [],
    },
  },
  theme: {
    screens: {
      'lg': '960px',
    },
    extend: {
        scale: {
          '-1': '-1'
        },
        colors: {
          primary: {
            light: '#E2FBFF',
            DEFAULT: '#00B6CE',
            dark: '#32636A',
          },
          muted: colors.gray,
        }
    },
    fontFamily: {
      'header': ['poppins', 'roboto'],
      'body': ['anonymous', 'verdana'],
     }
  },
  variants: {
    extend: {
      opacity: ['disabled'],
    }
  },
  plugins: [],
};
