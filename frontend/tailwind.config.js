/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        marca: {
          DEFAULT: "#2563EB",
          oscuro: "#1D4ED8",
          claro: "#DBEAFE",
        },
        panel: "#0B1220",
        fondo: "#F8FAFC",
        texto: {
          900: "#0F172A",
          700: "#334155",
          500: "#64748B",
          400: "#94A3B8",
        },
        exito: "#16A34A",
        atencion: "#F59E0B",
        critico: "#DC2626",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
      },
      boxShadow: {
        suave: "0 1px 2px 0 rgba(15, 23, 42, 0.06), 0 1px 3px 0 rgba(15, 23, 42, 0.10)",
        marca: "0 10px 30px -10px rgba(37, 99, 235, 0.45)",
      },
    },
  },
  plugins: [],
};
