import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        christmas: {
          red: '#C41E3A',
          green: '#165B33',
          gold: '#FFD700',
          snow: '#FFFAFA',
        },
      },
      animation: {
        'snow-fall': 'snowfall 10s linear infinite',
        'confetti': 'confetti 3s ease-in-out',
      },
      keyframes: {
        snowfall: {
          '0%': { transform: 'translateY(-10vh)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        confetti: {
          '0%': { transform: 'translateY(0) rotateZ(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotateZ(720deg)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}

export default config
