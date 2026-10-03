/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        forest: '#14532D',
        leaf: '#1F9D6B',
        wheat: { DEFAULT: '#E8A93A', soft: '#FBF1DA' },
        paper: '#F8FBF8',
        ink: '#1B2B21',
        muted: '#5E7365',
        line: '#D5E3D9',
      },
    },
  },
  plugins: [],
};