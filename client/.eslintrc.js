module.exports = {
  extends: ['react-app', 'react-app/jest', 'prettier'],
  rules: {
    'no-trailing-spaces': 'warn',
    'comma-dangle': ['warn', 'always-multiline'],
    'quotes': ['warn', 'single'],
    'indent': ['warn', 2],
    'eol-last': 'warn',
  }
};