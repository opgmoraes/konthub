/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#E8ECF4",
          100: "#C5CFE4",
          200: "#8FA4C8",
          400: "#4D6D99",
          600: "#1E3D72",
          800: "#041B47",
          900: "#020F28",
        },
        lime: {
          50: "#F4FBDA",
          100: "#E0F5A0",
          200: "#CAEE6A",
          400: "#AED93F",
          600: "#89B020",
          800: "#5C7A0E",
          900: "#314200",
        },
        status: {
          amber: "#FBBF24",
          red: "#F87171",
          blue: "#60A5FA",
        },
        // Variáveis que vão mudar sozinhas entre Light/Dark mode
        page: "var(--bg-page)",
        surface: "var(--bg-surface)",
        subtle: "var(--bg-subtle)",
        input: "var(--bg-input)",
      },
      textColor: {
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        muted: "var(--text-muted)",
      },
      borderColor: {
        DEFAULT: "var(--border)",
        md: "var(--border-md)",
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"], // A fonte oficial
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "18px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(4,27,71,0.06), 0 4px 16px rgba(4,27,71,0.06)",
      },
    },
  },
  plugins: [],
};
