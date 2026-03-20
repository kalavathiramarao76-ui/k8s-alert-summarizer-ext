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
          bg: '#0f1117',
          surface: '#161b22',
          border: '#30363d',
          accent: '#326ce5',
          'accent-hover': '#4a85f0',
          text: '#e6edf3',
          muted: '#8b949e',
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
