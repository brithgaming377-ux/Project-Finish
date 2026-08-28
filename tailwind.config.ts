import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  darkMode: 'class',
  content: ['./components/**/*.{vue,js,ts}', './layouts/**/*.vue', './pages/**/*.vue', './app.vue', './plugins/**/*.ts'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#17192D',
          soft: '#64677A',
          light: '#292C47'
        },
        parchment: {
          DEFAULT: '#FCFCFD',
          dim: '#F5F5F7'
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
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        body: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace']
      },
      borderRadius: {
        card: '8px'
      },
      boxShadow: {
        cover: '0 18px 34px rgba(23, 25, 45, 0.22)',
        card: '0 14px 32px rgba(23, 25, 45, 0.10)',
        premium: '0 1px 2px rgba(23, 25, 45, 0.04), 0 18px 36px -14px rgba(23, 25, 45, 0.18)'
      }
    }
  },
  plugins: []
}
