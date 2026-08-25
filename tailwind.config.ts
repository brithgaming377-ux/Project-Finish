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
          DEFAULT: '#14162B',
          soft: '#5B5F73',
          light: '#242640'
        },
        parchment: {
          DEFAULT: '#FFFFFF',
          dim: '#F6F7FA'
        },
        amber: {
          DEFAULT: '#C9A227',
          deep: '#A6821A'
        },
        sage: '#3F8F5F',
        rose: {
          DEFAULT: '#C24444',
          deep: '#A13636'
        },
        line: '#E7E8EE'
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace']
      },
      borderRadius: {
        card: '8px'
      },
      boxShadow: {
        cover: '0 12px 28px rgba(20, 22, 43, 0.14)',
        card: '0 8px 24px rgba(20, 22, 43, 0.08)',
        premium: '0 1px 2px rgba(20, 22, 43, 0.04), 0 12px 24px -8px rgba(20, 22, 43, 0.1)'
      }
    }
  },
  plugins: []
}
