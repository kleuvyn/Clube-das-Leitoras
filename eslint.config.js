export default [{
  ignores: [".next/**", "node_modules/**"],
  languageOptions: {
    parserOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
    },
    globals: {
      process: "readonly",
      window: "readonly",
    },
  },
  settings: {},
  rules: {
    "no-unused-vars": "warn",
    "no-console": "off",
  },
}];
