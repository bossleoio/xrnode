/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'xr-dark': '#1a1a2e',
        'xr-panel': '#2a2a4e',
        'xr-accent': '#00f0ff',
        'xr-secondary': '#7000ff',
        'xr-dim': '#808080',
      },
      boxShadow: {
        'xr-accent': '0 0 20px rgba(0, 240, 255, 0.3)',
        'xr-secondary': '0 0 20px rgba(112, 0, 255, 0.3)',
      },
    },
  },
  plugins: [],
}
