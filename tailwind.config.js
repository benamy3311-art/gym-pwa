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
                background: 'var(--bg-base)',
                surface: 'var(--bg-surface)',
                primary: 'var(--text-primary)',
                secondary: 'var(--text-secondary)',
                tertiary: 'var(--text-tertiary)',
                accent: 'var(--accent)',
                'accent-hover': 'var(--accent-hover)',
                'glass-base': 'var(--glass-base)',
                'glass-elevated': 'var(--glass-elevated)',
                'glass-inset': 'var(--glass-inset)',
                'glass-border': 'var(--glass-border)',
                'glass-highlight': 'var(--glass-highlight)',
            },
            borderRadius: {
                'xl': '16px',
                '2xl': '20px',
                '3xl': '24px',
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
                'glass-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.2)',
                'inner-light': 'none',
                'inner-dark': 'none',
            }
        },
    },
    plugins: [],
}
