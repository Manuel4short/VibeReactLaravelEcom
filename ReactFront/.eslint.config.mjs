import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import pluginJest from "eslint-plugin-jest";
import babelParser from "@babel/eslint-parser";
export default [
  {
    ...pluginJs.configs.recommended,

    plugins: {
      react: pluginReact,
      jest: pluginJest,
    },

    languageOptions: {
      globals: { ...globals.browser, ...globals.jest },
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ["@babel/preset-react"],
        },
      },
    },

    settings: {
      react: {
        version: "detect",
      },
    },

    rules: {
      ...pluginReact.configs.recommended?.rules,
      ...pluginJest.configs.recommended?.rules,

      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },

    files: ["**/*.{js,mjs,cjs,jsx}"],
  },
];
