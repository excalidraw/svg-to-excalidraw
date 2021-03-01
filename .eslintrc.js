module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 12,
  },
  plugins: ["import", "@typescript-eslint"],
  extends: ["@excalidraw/eslint-config"],
  rules: {
    "no-console": 0,
  },
  overrides: [
    {
      files: ["webpack.config.js"],
      rules: {
        "@typescript-eslint/no-var-requires": 0,
      },
    },
  ],
};
