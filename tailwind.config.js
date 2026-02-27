/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                background: 'rgba(var(--background))',
                foreground: 'rgba(var(--foreground))',
                glass: 'rgba(var(--glass))',
                'glass-border': 'rgba(var(--glass-border))',
            }
        },
    },
    plugins: [],
}
