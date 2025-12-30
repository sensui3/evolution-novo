/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./App.tsx",
        "./components/**/*.{ts,tsx}",
        "./features/**/*.{ts,tsx}",
        "./services/**/*.{ts,tsx}",
        "./hooks/**/*.{ts,tsx}",
        "./lib/**/*.{ts,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "var(--primary)",
                "background": "var(--background)",
                "surface": "var(--surface)",
                "border": "var(--border)",
                "text-main": "var(--text-main)",
                "text-muted": "var(--text-muted)",
            },
            fontFamily: {
                "display": ["Space Grotesk", "sans-serif"],
                "mono": ["Roboto Mono", "monospace"]
            },
            boxShadow: {
                'brutal': '4px 4px 0px 0px #000',
                'brutal-sm': '2px 2px 0px 0px #000',
                'glow': '0 0 15px rgba(0, 240, 255, 0.25)',
            }
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/container-queries'),
    ],
}
