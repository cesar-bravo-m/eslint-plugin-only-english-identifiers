// eslint.config.js
const myPlugin = require("./src");

module.exports = [
  {
    files: ["**/*.js"],
    plugins: {
      "my-rules": myPlugin,
    },
    rules: {
      "my-rules/only-english-identifiers": ["warn", {whitelist: ['nombre']}]
    },
  },
];
