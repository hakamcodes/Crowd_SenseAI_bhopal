/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17201c",
        civic: "#0f766e",
        river: "#2563eb",
        saffron: "#d97706",
        paper: "#f7f8f4",
      },
      boxShadow: {
        soft: "0 16px 50px rgba(23, 32, 28, 0.12)",
        card: "0 8px 24px rgba(23, 32, 28, 0.08)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
