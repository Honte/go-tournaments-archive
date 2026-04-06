/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './events/**/*.{ts,tsx,css}',
  ],
  theme: {
    extend: {
      animation: {
        border: 'border 4s linear infinite',
      },
      keyframes: {
        border: {
          to: { '--border-angle': '360deg' },
        },
      },
    },
  },
  plugins: [],
};
