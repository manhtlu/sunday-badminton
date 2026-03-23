import type { Config } from 'tailwindcss'

export default <Config>{
  theme: {
    extend: {
      colors: {
        // Custom brand colors
        brand: {
          DEFAULT: '#026a52',
          50: '#c5ffe8',
          100: '#a0f0d4',
          200: '#6ee0b8',
          300: '#3cc998',
          400: '#1aa577',
          500: '#026a52',
          600: '#025a46',
          700: '#014a39',
          800: '#013a2d',
          900: '#002a20',
        },
      },
    },
  },
}
