/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            colors: {
                // Indigo moderno (primário) - marketplace genérico
                brand: {
                    50:  '#eef2ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    300: '#a5b4fc',
                    400: '#818cf8',
                    500: '#6366f1',
                    600: '#4f46e5',
                    700: '#4338ca',
                    800: '#3730a3',
                    900: '#312e81',
                },
                // Laranja accent (CTA, ofertas) - clássico e-commerce
                accent: {
                    50:  '#fff7ed',
                    100: '#ffedd5',
                    200: '#fed7aa',
                    300: '#fdba74',
                    400: '#fb923c',
                    500: '#f97316',
                    600: '#ea580c',
                    700: '#c2410c',
                    800: '#9a3412',
                    900: '#7c2d12',
                },
            },
            fontFamily: {
                sans: ['Manrope', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                card: '0 1px 2px rgb(0 0 0 / 0.04), 0 4px 16px rgb(0 0 0 / 0.06)',
                cardHover: '0 4px 20px rgb(0 0 0 / 0.12)',
            },
        },
    },
    plugins: [],
};
