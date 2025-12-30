/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./App.tsx",
        "./components/**/*.{ts,tsx}",
        "./services/**/*.{ts,tsx}",
        "./lib/**/*.{ts,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#00f0ff",
                "background-dark": "#0f172a",
                "surface-dark": "#1e293b",
                "border-dark": "#334155",
                "text-light": "#f1f5f9",
                "text-muted": "#94a3b8",
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
