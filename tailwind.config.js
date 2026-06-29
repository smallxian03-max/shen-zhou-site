/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ee',
          100: '#fdedd3',
          200: '#f9d7a5',
          300: '#f5ba6d',
          400: '#f09333',
          500: '#ec7a12',
          600: '#dd5f08',
          700: '#b74609',
          800: '#92380f',
          900: '#763010',
        },
        shen: {
          light: '#fce4ec',
          DEFAULT: '#e91e63',
          dark: '#c2185b',
        },
        zhou: {
          light: '#e3f2fd',
          DEFAULT: '#1976d2',
          dark: '#1565c0',
        },
      },
      fontFamily: {
        'handwrite': ['"ZCOOL KuaiLe"', 'cursive', 'sans-serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'bounce-slow': 'bounce 2s infinite',
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'paw-print': 'pawPrint 0.5s ease-out',
        'celebration': 'celebration 0.6s ease-out forwards',
        'sparkle': 'sparkle 1s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out',
        'pop': 'pop 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pawPrint: {
          '0%': { opacity: '0', transform: 'scale(0.5) translateX(-10px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateX(0)' },
        },
        celebration: {
          '0%': { transform: 'scale(0) rotate(0deg)', opacity: '0' },
          '50%': { transform: 'scale(1.2) rotate(10deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        sparkle: {
          '0%': { transform: 'scale(0) rotate(0deg)', opacity: '0' },
          '50%': { transform: 'scale(1.5) rotate(180deg)', opacity: '1' },
          '100%': { transform: 'scale(0) rotate(360deg)', opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pop: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
