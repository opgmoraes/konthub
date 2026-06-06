/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        surface: "#121212",
        surfaceLight: "#1e1e1e",
        neon: {
          cyan: "#00f3ff",
          lime: "#39ff14",
        },
      },
      backdropBlur: {
        jateado: "12px",
      },
      boxShadow: {
        "glow-cyan": "0 0 20px rgba(0, 243, 255, 0.15)",
        "glow-lime": "0 0 20px rgba(57, 255, 20, 0.15)",
      },
    },
  },
  plugins: [],
};
