/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'pgc-dark': '#222222',
        'pgc-light': '#F3F4F6FF',
        'pgc-primary': '#5287ae',
        'pgc-hover': '#FFD700'
      },
      screens: {
        xs: '420px'
      }
    },
  },
  plugins: [],
}
