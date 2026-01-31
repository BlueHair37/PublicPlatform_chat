export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#197fe6", // Updated to dashboard primary
        "busan-light": "#f0f7ff",
        "background-light": "#f6f7f8", // Updated
        "background-dark": "#111921", // Updated
        "accent-red": "#ef4444",
        "accent-green": "#22c55e",
        "accent-orange": "#f59e0b"
      },
      fontFamily: {
        "sans": ["Noto Sans KR", "sans-serif"],
        "display": ["Noto Sans KR", "Public Sans", "sans-serif"]
      },
      borderRadius: {
        "lg": "0.5rem", // Adjusted
        "xl": "0.75rem", // Adjusted
        "2xl": "1rem", // Added for compatibility if needed
      },
    },
  },
  plugins: [],
}

