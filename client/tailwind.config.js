/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/app/**/*.tsx', './src/components/**/*.tsx', './src/core/**/**/*.tsx'],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui'), require('@tailwindcss/typography')],
  daisyui: {
    themes: ['light', 'dark', 'cupcake'],
  },
};
