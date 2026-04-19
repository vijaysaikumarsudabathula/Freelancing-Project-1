/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'vist-green': '#108242',
        'vist-leaf': '#A4C639',
        'vist-dark': '#2D5A27',
        'vist-soft': '#FAF9F6',
      },
      fontFamily: {
        'serif': ['Playfair Display', 'serif'],
        'sans': ['Inter', 'sans-serif'],
      },
      backgroundColor: {
        'gradient-green': 'linear-gradient(135deg, #108242 0%, #0d6233 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [],
}
