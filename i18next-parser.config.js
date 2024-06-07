module.exports = {
  defaultNamespace: "translation",
  lineEnding: "\n",
  locales: ["fi", "sv", "en"],
  output: "src/i18n/$LOCALE/$NAMESPACE.json",
  input: ["src/**/*.{ts,tsx}", "!**/__tests__/*"],
  keySeparator: false,
  namespaceSeparator: false,
  contextSeparator: false,
  createOldCatalogs: false,
};
