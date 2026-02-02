/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0A192F',
          light: '#112240',
          lighter: '#233554',
        },
        electric: {
          DEFAULT: '#00F0FF',
          dim: '#00c4cc',
        },
        slate: {
          light: '#ccd6f6',
          DEFAULT: '#8892b0',
          dark: '#495670',
        },
      },
      transitionDuration: {
        0: '0ms',
      },
      boxShadow: {
        glow: '0 0 20px rgba(0, 240, 255, 0.15)',
        'glow-strong': '0 0 30px rgba(0, 240, 255, 0.25)',
      },
    },
  },
  plugins: [],
}
