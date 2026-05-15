// Copyright The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { defineConfig } from "eslint/config";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  {
    extends: compat.extends("eslint:recommended", "prettier"),

    languageOptions: {
      globals: {
        ...globals.node,
      },

      ecmaVersion: 2021,
      sourceType: "module",
    },

    rules: {
      "no-unused-vars": [
        "error",
        {
          vars: "local",
          argsIgnorePattern: "^_",
        },
      ],

      // Camelcase and dangling _ are useful to name functions to match their
      // Lowdefy names.
      camelcase: 0,
      "no-underscore-dangle": 0,
    },
  },
]);
