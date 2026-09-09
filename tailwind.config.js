/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#FF6B4A', // Electric Coral / Amber primary accent
          hover: '#FF8566',
          hoverLight: '#E85A3A',
          hoverDark: '#FF8566',
          glow: 'rgba(255, 107, 74, 0.25)',
        },
        darkBase: {
          950: '#0A0A0A', // Primary dark background
          900: '#171717', // Secondary dark cards/surfaces
          850: '#1E1E1E',
          800: '#262626', // Dark borders/dividers
          700: '#333333',
          600: '#525252',
          500: '#737373',
          400: '#A3A3A3', // Secondary muted text
          300: '#D4D4D4',
          200: '#E5E5E5',
          100: '#F5F5F5',
          50: '#FAFAFA',  // Primary light text on dark
        },
        lightBase: {
          DEFAULT: '#FFFFFF', // Primary light background
          50: '#FFFFFF',
          100: '#F5F5F5', // Secondary light cards/surfaces
          200: '#EEEEEE',
          300: '#E5E5E5', // Light borders/dividers
          400: '#A3A3A3',
          500: '#737373', // Secondary muted text
          700: '#525252',
          900: '#171717', // Primary dark text on light
        },
        brand: {
          DEFAULT: '#FF6B4A',
          coral: '#FF6B4A',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'coral': '0 0 20px rgba(255, 107, 74, 0.35)',
        'coral-lg': '0 0 35px rgba(255, 107, 74, 0.5)',
        'coral-glow': '0 0 25px rgba(255, 107, 74, 0.25)',
        'card-glow': '0 10px 30px -5px rgba(255, 107, 74, 0.15)',
        'card-glow-light': '0 10px 30px -5px rgba(255, 107, 74, 0.08)',
        'elevated': '0 10px 30px -5px rgba(0, 0, 0, 0.05)',
        'elevated-dark': '0 20px 40px -10px rgba(0, 0, 0, 0.8)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      }
    },
  },
  plugins: [],
}
