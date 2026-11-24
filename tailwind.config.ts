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
      colors: {
        red: { ...colors.red, 500: '#D42422', 600: '#C8161A', 700: '#A50F13' },
        // 2026-11 neutrals (PayFamily-brand/14-web/tokens.css). ink = text and the deductions ramp, darkest first.
        ink: { DEFAULT: '#15171C', 2: '#2B2E36', 3: '#535866', 4: '#7C818D', 5: '#A2A6B0' },
        pearl: { DEFAULT: '#F4F4F8', soft: '#F7F7FA', shade: '#D9DBE7' },
        line: '#E3E3EA',
        mute: '#5E6270',   // secondary text: 5.6:1 on pearl, 6.2:1 on white
      },
    },
  },
  plugins: [],
};

export default config;
