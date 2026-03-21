/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './popup.html',
    './sidepanel.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        k8s: {
          bg: 'var(--k8s-bg)',
          surface: 'var(--k8s-surface)',
          border: 'var(--k8s-border)',
          accent: 'var(--k8s-accent)',
          'accent-hover': 'var(--k8s-accent-hover)',
          text: 'var(--k8s-text)',
          muted: 'var(--k8s-muted)',
          p0: '#ff4444',
          p1: '#ff8800',
          p2: '#ffcc00',
          p3: '#44bb44',
          p4: '#4488ff',
        },
      },
    },
  },
  plugins: [],
};
