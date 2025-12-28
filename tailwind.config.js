/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#0f131a",
        panel: "#141a24",
        panelAlt: "#0b0f16",
        accent: "#f5c84c",
        accentSoft: "#f7dd8a",
        ink: "#e8ecf2",
        inkMuted: "#a6b0c3",
        danger: "#ff6b6b",
      },
      fontFamily: {
        display: ["\"Space Grotesk\"", "system-ui", "sans-serif"],
        mono: ["\"JetBrains Mono\"", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        panel: "0 24px 40px rgba(0,0,0,0.35)",
      },
    },
  },
  plugins: [],
};
