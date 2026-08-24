import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue'
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1B1F3B',
          soft: '#4A4E69',
          light: '#262B52'
        },
        parchment: {
          DEFAULT: '#F7F3E8',
          dim: '#EFE9D8'
        },
        amber: {
          DEFAULT: '#E8A33D',
          deep: '#C97F1E'
        },
        sage: '#6B8F71',
        line: 'rgba(27, 31, 59, 0.12)'
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace']
      },
      borderRadius: {
        card: '6px'
      },
      boxShadow: {
        cover: '0 10px 26px rgba(27, 31, 59, 0.16)',
        card: '0 8px 20px rgba(27, 31, 59, 0.1)'
      }
    }
  },
  plugins: []
}
