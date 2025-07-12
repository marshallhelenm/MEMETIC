export default {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["./jest.setup.mjs"],
  extensionsToTreatAsEsm: [".jsx"],
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  collectCoverage: false,
  collectCoverageFrom: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.test.{js,jsx,ts,tsx}",
    "./src/**/index.{js,jsx,ts,tsx}",
  ],
  coverageReporters: ["text", "lcov"],
};
