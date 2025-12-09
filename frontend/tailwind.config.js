/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Elkhawaga Brand Identity - Earthy Camel Theme
                espresso: {
                    DEFAULT: '#4A3B32',
                    dark: '#3A2D25',
                    light: '#5C4A3E',
                },
                camel: {
                    DEFAULT: '#D4A066',
                    light: '#E8DED2',
                    gold: '#C9A359',
                },
                cream: {
                    DEFAULT: '#F9F7F5',
                    warm: '#FFFBF7',
                    beige: '#E8DED2',
                },
                // Legacy primary colors (keep for compatibility)
                primary: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                },
            },
            fontFamily: {
                'sans': ['Inter', 'system-ui', 'sans-serif'],
                'serif': ['Playfair Display', 'Georgia', 'serif'],
            },
            borderRadius: {
                'elkhawaga': '12px',
            },
            backgroundImage: {
                'gradient-beige': 'linear-gradient(135deg, #E8DED2 0%, #F9F7F5 100%)',
                'gradient-gold': 'linear-gradient(135deg, #D4A066 0%, #C9A359 100%)',
                'gradient-espresso': 'linear-gradient(135deg, #4A3B32 0%, #3A2D25 100%)',
            },
        },
    },
    plugins: [],
}

