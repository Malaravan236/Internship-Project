module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
    browser: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "google",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
  },
  ignorePatterns: [
    "lib/**/*", // Ignore compiled JS files
    "node_modules",
    "*.config.js",
  ],
  plugins: [
    "@typescript-eslint",
    "import",
    "react",
  ],
  rules: {
    "quotes": ["error", "double"],
    "import/no-unresolved": "off",
    "indent": ["error", 2],
    "@typescript-eslint/no-unused-expressions": "off", // Disable crashing rule
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off", // for React 17+
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
