module.exports = {
  coverageDirectory: "coverage",
  testEnvironment: "node",
  collectCovergeFrom: ["**/src/**/*.js", "!**/src/main/**"],
  preset: "@shelf/jest-mongodb",
};
