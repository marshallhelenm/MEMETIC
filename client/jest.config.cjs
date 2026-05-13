module.exports = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["./jest.setup.mjs"],
  extensionsToTreatAsEsm: [".jsx", ".ts", ".tsx"],
  transform: {
    "^.+\\.[jt]sx?$": ["babel-jest", { configFile: "./babel.config.mjs" }],
  },
  moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json", "node"],
  collectCoverage: false,
  collectCoverageFrom: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.test.{js,jsx,ts,tsx}",
    "./src/**/index.{js,jsx,ts,tsx}",
  ],
  coverageReporters: ["text", "lcov"],
};
