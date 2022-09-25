module.exports = {
    env: {
        browser: true,
        es2021: true,
    },

    extends: [
        // "eslint:recommended", // https://github.com/eslint/eslint/issues/8726#issuecomment-308547027
        'plugin:react/recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react-hooks/recommended',
        'prettier', // should be the last to override others
    ],

    overrides: [],

    parser: '@typescript-eslint/parser',

    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },

    plugins: ['react', '@typescript-eslint', 'prettier'],

    rules: {
        'react/display-name': 'off',
        'react/react-in-jsx-scope': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        // 'prettier/prettier': 'error',
        'prettier/prettier': 'off',
    },

    ignorePatterns: ['./config/**/*', './public/**/*', './*.config.js'],
};
