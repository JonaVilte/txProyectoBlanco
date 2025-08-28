const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  // Entorno de test
  testEnvironment: "node",

  // Transformaciones de ts-jest
  transform: {
    ...tsJestTransformCfg,
  },

  // Archivos de test que Jest va a reconocer
  testMatch: ["**/test/**/*.(test|spec).ts", "**/?(*.)+(test|spec).ts"],

  // Extensiones que Jest reconoce
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],

  // Cobertura opcional
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],

  // Ignorar node_modules excepto paquetes que usen TS moderno
  transformIgnorePatterns: ["node_modules/(?!(some-esm-package)/)"],
};
