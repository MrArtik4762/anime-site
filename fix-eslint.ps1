Write-Host "?? Исправление ESLint ошибок..."
npx eslint src/ --fix

@'
module.exports = {
  extends: ['react-app', 'react-app/jest'],
  rules: {
    'no-trailing-spaces': 'warn',
    'comma-dangle': ['warn', 'always-multiline'],
    'quotes': ['warn', 'single'],
    'indent': ['warn', 2],
    'eol-last': 'warn',
  }
};
'@ | Out-File -FilePath ".eslintrc.js" -Encoding utf8

npx eslint src/ --fix
Write-Host " Готово"
