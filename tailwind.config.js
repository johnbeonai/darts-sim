/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darts: {
          green: '#1a472a',
          red: '#c41e3a',
          gold: '#d4af37',
          black: '#121212',
          cream: '#fdfbf7',
          boardDark: '#1e2420',
          boardRed: '#dc2626',
          boardGreen: '#15803d'
        }
      },
      keyframes: {
        'bounce-in': {
          '0%': { transform: 'scale(1.5) translate(-50%, -50%)', opacity: '0' },
          '60%': { transform: 'scale(0.9) translate(-50%, -50%)', opacity: '1' },
          '100%': { transform: 'scale(1) translate(-50%, -50%)', opacity: '1' },
        }
      },
      animation: {
        'bounce-in': 'bounce-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) both'
      }
    },
  },
  plugins: [],
}