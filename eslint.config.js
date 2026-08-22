const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  {
    ignores: [
      '**/index_bundle.js',
      '**/config.js',
      '**/diff.js',
      '**/diverged.js',
      '**/divergedWorker.js',
      '**/examples/**',
      '**/old_splash_page_v2.0/**',
      '**/dist/**',
      '**/angular.min.js',
      '**/js/vendor/**'
    ]
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: globals.node
    },
    rules: {
      'no-multi-str': 'off',
      'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none' }],
      'preserve-caught-error': 'off'
    }
  },
  {
    files: [
      'capture/backstopTools.js',
      'capture/engine_scripts/**/*.js',
      'core/util/runPlaywright.js',
      'core/util/runPuppet.js',
      'test/configs/backstop_data/engine_scripts/**/*.js'
    ],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser
      }
    }
  },
  {
    files: ['compare/src/**/*.js'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      sourceType: 'module',
      globals: globals.browser
    },
    rules: {}
  },
  {
    files: ['test/**/*.js'],
    languageOptions: {
      globals: globals.mocha
    }
  }
];
