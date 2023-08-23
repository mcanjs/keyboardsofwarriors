/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/app/**/*.tsx', './src/components/**/*.tsx', './src/core/**/**/*.tsx'],
  theme: {
    extend: {},
    container: {
      padding: {
        DEFAULT: '15px',
      },
    },
  },
  plugins: [require('daisyui'), require('@tailwindcss/typography')],
  daisyui: {
    themes: ['light', 'dark', 'cupcake'],
  },
};
