/** @type {import('tailwindcss').Config} */
// Tokens de diseño ALFELA (derivados de Stitch · proyecto 8390617209320712874)
module.exports = {
  content: ['./*.html', './assets/js/**/*.js'],
  // hover: solo en dispositivos con puntero fino (evita el hover "pegado" tras tocar en móvil)
  future: { hoverOnlyWhenSupported: true },
  theme: {
    extend: {
      colors: {
        navy: '#003B5E',
        sky: '#9AD7F9',
        gold: { DEFAULT: '#CD8C00', dark: '#8A5E00' },
        sand: '#F4E6D3',
        cream: '#FBF5EC',
        footer: '#002A44',
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      // Escala tipográfica de Stitch
      fontSize: {
        'display-hero': ['56px', { lineHeight: '64px', letterSpacing: '-0.02em', fontWeight: '400' }],
        'headline-lg': ['40px', { lineHeight: '48px', letterSpacing: '-0.01em', fontWeight: '400' }],
        'headline-lg-mobile': ['30px', { lineHeight: '36px', fontWeight: '400' }],
        'headline-md': ['28px', { lineHeight: '36px', fontWeight: '400' }],
        'headline-sm': ['22px', { lineHeight: '28px', fontWeight: '400' }],
        'body-lg': ['18px', { lineHeight: '28px' }],
        'body-md': ['15px', { lineHeight: '24px' }],
        'body-sm': ['13px', { lineHeight: '20px' }],
        eyebrow: ['13px', { lineHeight: '16px', letterSpacing: '0.14em', fontWeight: '700' }],
        'label-button': ['14px', { lineHeight: '18px', letterSpacing: '0.04em', fontWeight: '700' }],
      },
      borderRadius: {
        card: '24px',
        photo: '28px',
      },
      // Curvas de animación (mismos valores que --ease-* en src/input.css)
      transitionTimingFunction: {
        out: 'cubic-bezier(0.23, 1, 0.32, 1)',
        drawer: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      boxShadow: {
        bar: '0 -4px 16px rgba(0, 37, 61, 0.06)',
        header: '0 1px 8px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
};
