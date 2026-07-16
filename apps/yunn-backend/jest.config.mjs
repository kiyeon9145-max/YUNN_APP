import { createDefaultPreset } from "ts-jest";

const tsJestTransformCfg = createDefaultPreset().transform;

export default {
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.mjs"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        ...tsJestTransformCfg["^.+\\.tsx?$"],
        tsconfig: "tsconfig.test.json",
      },
    ],
  },
};