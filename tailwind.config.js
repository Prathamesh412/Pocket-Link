module.exports = {
  content: [
    './public/**/*.html',
    './public/**/*.js',
    './src/views/**/*.ejs',
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          900: '#1e293b',
        },
        gray: {
          50: '#f9fafb',
        },
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
