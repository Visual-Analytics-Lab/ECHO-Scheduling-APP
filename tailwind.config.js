/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./imports/ui/**/*.{js,jsx,ts,tsx}",
    "./client/*.html",
  ],
  theme: {
    extend: { 
      colors: {
        "echo-maroon": "#721d35",
        "echo-gold": "#f9b126",
        "echo-teal": "#0ea6b2",
        "bg-light": "theme(colors.gray.100)",
        "bg-dark": "theme(colors.neutral.700)",
      },
      boxShadow: {
        'full-border': "0 0 4px gray",
      }
    },
  },
  plugins: [],
}