// tailwind.config.js
const colors = require('tailwindcss/colors');

module.exports = {
    // darkMode: 'media',
    content: [
        './src/**/*.html',
        './src/**/*.js',
        './src/manifest-*/manifest.json',
        './src/popup.html',
        './src/options.html'
    ],
    theme: {
        extend: {}
    },
    safelist: [
        // Toggles states produced dynamically
        'bg-green-600','bg-red-600','bg-slate-600','bg-slate-600/20','text-green-400','text-red-400','fa-spin',
        // API status badges dynamic classes
        'bg-amber-500','bg-slate-600','animate-pulse'
    ],
    plugins: [
        require('@tailwindcss/forms')
    ]
}
