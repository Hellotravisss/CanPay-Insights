import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

const config: Config = {
  content: [
    './*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Instrument Sans"', '"PingFang SC"', '"Noto Sans SC"', 'sans-serif'],
        brand: ['"Bricolage Grotesque"', '"Instrument Sans"', 'sans-serif'],   // the wordmark only
        display: ['Fraunces', 'Georgia', '"Noto Serif SC"', 'serif'],
      },
      // brand red from the 2026-11 logo; every other red shade stays Tailwind's
      colors: { red: { ...colors.red, 500: '#D42422', 600: '#C8161A', 700: '#A50F13' } },
    },
  },
  plugins: [],
};

export default config;
