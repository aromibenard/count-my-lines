import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";


export default defineConfig([
  {
    files: ["**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node
      },
      sourceType: "module",
    },
    rules: {
      "no-unused-vars": "warn",
      "no-await-in-loop": "error",
      "require-atomic-updates": "error"
    }
  }
]);