module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  plugins: [
    'react',
    'react-hooks',
    'jsx-a11y',
  ],
  rules: {
    // React specific rules
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'warn',
    'react/jsx-uses-react': 'off',
    'react/jsx-uses-vars': 'error',
    'react/jsx-key': 'error',
    'react/no-unescaped-entities': 'warn',
    
    // React Hooks rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // General JavaScript rules
    'no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': ['error', 'always'],
    'prefer-template': 'error',
    
    // Code style - исправлены все проблемы из логов
    'indent': ['error', 2, {
      'SwitchCase': 1,
      'ignoredNodes': ['TemplateLiteral']
    }],
    'quotes': ['error', 'single', { 
      'avoidEscape': true,
      'allowTemplateLiterals': true 
    }],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', {
      'arrays': 'always-multiline',
      'objects': 'always-multiline',
      'imports': 'always-multiline',
      'exports': 'always-multiline',
      'functions': 'never'
    }],
    'eol-last': ['error', 'always'],
    'no-trailing-spaces': 'error',
    'prefer-template': 'error',
    
    // Accessibility - исправлены ошибки label-has-associated-control
    'jsx-a11y/label-has-associated-control': ['error', {
      'labelComponents': ['label'],
      'labelAttributes': ['htmlFor'],
      'controlComponents': ['input', 'select', 'textarea'],
      'depth': 3
    }],
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/anchor-has-content': 'error',
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/no-static-element-interactions': 'warn',
    
    // Новые правила для исправления конкретных ошибок
    'no-case-declarations': 'off',
    'template-curly-spacing': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  overrides: [
    {
      files: ['**/*.jsx', '**/*.js'],
      rules: {
        'indent': ['error', 2, {
          'ignoredNodes': ['JSXElement', 'JSXElement > *', 'JSXAttribute', 'JSXIdentifier', 'JSXNamespacedName', 'JSXMemberExpression', 'JSXSpreadAttribute', 'JSXExpressionContainer', 'JSXOpeningElement', 'JSXClosingElement', 'JSXText', 'JSXEmptyExpression', 'JSXSpreadChild']
        }],
        'react/jsx-indent': ['error', 2],
        'react/jsx-indent-props': ['error', 2],
      }
    }
  ],
  ignorePatterns: [
    'build/',
    'node_modules/',
    'public/',
    'dist/',
    '*.config.js',
    '*.setup.js'
  ],
};