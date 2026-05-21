/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0f',
        surface: '#15151f',
        ink: '#f5f5f7',
        muted: '#8a8a99',
        accent: '#c4ff3d',   // gen-z lime
        hot: '#ff3d8a',      // hot pink
        electric: '#7c5cff', // violet
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(196,255,61,0.5)',
      },
    },
  },
  plugins: [],
};
