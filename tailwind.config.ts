import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  darkMode: 'class',
  content: ['./components/**/*.{vue,js,ts}', './layouts/**/*.vue', './pages/**/*.vue', './app.vue', './plugins/**/*.ts'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#12372F',
          soft: '#526B62',
          light: '#1B5548'
        },
        campus: {
          DEFAULT: '#0F766E',
          light: '#159A8C',
          pale: '#DFF4EE'
        },
        parchment: {
          DEFAULT: '#F4FAF7',
          dim: '#EAF6F1'
        },
        amber: {
          DEFAULT: '#D8A74D',
          deep: '#B57F28'
        },
        sage: '#278A67',
        crimson: '#8C2638',
        rose: {
          DEFAULT: '#C24444',
          deep: '#A13636'
        },
        line: '#D9E8E3'
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
        cover: '0 18px 34px rgba(15, 118, 110, 0.22)',
        card: '0 14px 32px rgba(15, 118, 110, 0.10)',
        premium: '0 1px 2px rgba(15, 118, 110, 0.04), 0 18px 36px -14px rgba(15, 118, 110, 0.18)'
      }
    }
  },
  plugins: []
}
