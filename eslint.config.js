import js from "@eslint/js"
import importPlugin from "eslint-plugin-import"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import unusedImports from "eslint-plugin-unused-imports"
import { defineConfig, globalIgnores } from "eslint/config"
import globals from "globals"
import tseslint from "typescript-eslint"

// Adapted from builder-crm-ui's config, minus the Storybook plugin, which this project does not use.
export default defineConfig([
  globalIgnores(["dist", "src/routeTree.gen.ts"]),
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      import: importPlugin,
      "unused-imports": unusedImports
    },
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser
    },
    rules: {
      "unused-imports/no-unused-imports": "error",

      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "object",
            "type"
          ],
          pathGroups: [
            { pattern: "react", group: "external", position: "before" },
            { pattern: "@/**", group: "internal" }
          ],
          pathGroupsExcludedImportTypes: ["react"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true }
        }
      ],

      // The codebase leans on inference; an explicit any is a deliberate escape hatch worth
      // seeing in review, not worth failing a build over.
      "@typescript-eslint/no-explicit-any": "warn",

      // A fast-refresh convenience rule, not a correctness one. Every shadcn primitive trips it,
      // because badge and button export their cva variants and form exports useFormField
      // alongside the component. Splitting vendored files to satisfy it would make them harder to
      // re-sync with upstream, so it warns rather than fails the build.
      "react-refresh/only-export-components": "warn",

      // Underscore-prefixed arguments are the convention for a deliberately unused parameter,
      // which comes up in every map callback that only wants the index.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ]
    }
  },
  {
    // permission-cache.ts is a synchronous, non-reactive cache read meant only for beforeLoad
    // route guards (application/route-guards.ts). Reading it from presentation/ or ui/ code is
    // exactly the reference's bug: nothing re-renders once /me resolves, so a restricted user
    // briefly sees the full UI on a hard reload.
    files: ["src/domains/*/presentation/**/*.{ts,tsx}", "src/shared/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/domains/authorization/application/permission-cache",
              message:
                "Non-reactive cache read, for beforeLoad route guards only. Use usePermissionState, RequirePermission or usePermission instead."
            }
          ]
        }
      ]
    }
  }
])
