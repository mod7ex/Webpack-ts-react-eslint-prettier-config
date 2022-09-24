module.exports = {
  env: {
    browser: true,
    es2021: true,
  },

  extends: [
    // "eslint:recommended", // https://github.com/eslint/eslint/issues/8726#issuecomment-308547027
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
  ],

  overrides: [],

  parser: "@typescript-eslint/parser",

  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },

  plugins: ["react", "@typescript-eslint"],

  rules: {
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
  },
};
