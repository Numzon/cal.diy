/**
 * dependency-cruiser config for the structural map (context/map/artifact-2-structure.md).
 *
 * Workspace aliases (`@calcom/*`) are resolved to source through tsconfig.depcruise.json, so the
 * graph can be built without `yarn install`. Generated code (prisma client, *.generated.ts output
 * of app-store-cli) is therefore unresolved or excluded by design.
 *
 * Usage (tool lives outside the repo, nothing is added to package.json):
 *   node <tool>/node_modules/dependency-cruiser/bin/dependency-cruiser.mjs \
 *     --config .dependency-cruiser.cjs --ts-config tsconfig.depcruise.json \
 *     --output-type json apps/web apps/api/v2/src packages
 *
 * Layer rules mirror agents/rules/architecture-circular-dependencies.md.
 */

const NON_PRODUCTION =
  "(\\.(test|spec|e2e)\\.[jt]sx?$|/__tests__/|/__mocks__/|/playwright/|/test/|/tests/|/testing/|/vitest-mocks/)";

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "warn",
      comment: "Cycles make a change in one file ripple into every file of the loop.",
      from: {},
      to: { circular: true },
    },
    {
      name: "lib-not-to-higher-layers",
      severity: "error",
      comment: "packages/lib is the lowest layer: no app-store, features, trpc or web.",
      from: { path: "^packages/lib/" },
      to: { path: "^(packages/app-store|packages/features|packages/trpc|apps/web)/" },
    },
    {
      name: "app-store-not-to-features-or-trpc",
      severity: "error",
      from: { path: "^packages/app-store/" },
      to: { path: "^(packages/features|packages/trpc)/" },
    },
    {
      name: "features-not-to-trpc-or-web",
      severity: "error",
      from: { path: "^packages/features/" },
      to: { path: "^(packages/trpc|apps/web)/" },
    },
    {
      name: "trpc-not-to-web",
      severity: "error",
      from: { path: "^packages/trpc/" },
      to: { path: "^apps/web/" },
    },
    {
      name: "atoms-not-to-trpc-or-web",
      severity: "error",
      from: { path: "^packages/platform/atoms/" },
      to: { path: "^(packages/trpc|apps/web)/" },
    },
    {
      name: "platform-types-is-foundation",
      severity: "error",
      comment: "packages/platform/types must not depend on features, trpc, web or atoms.",
      from: { path: "^packages/platform/types/" },
      to: { path: "^(packages/features|packages/trpc|apps/web|packages/platform/atoms)/" },
    },
    {
      name: "web-is-top-not-imported-by-packages",
      severity: "error",
      from: { path: "^packages/", pathNot: "^packages/(testing|app-store/.*/(pages|components))/" },
      to: { path: "^apps/web/" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    includeOnly: "^(apps/web|apps/api/v2/src|packages)/",
    exclude: {
      path: [
        "(^|/)node_modules/",
        "(^|/)\\.next/",
        "(^|/)dist/",
        "/generated/",
        "\\.d\\.ts$",
        "/migrations/",
        "/locales/",
        NON_PRODUCTION,
      ],
    },
    // "specify" keeps type-only imports in the graph and marks them with preCompilationOnly=true,
    // so runtime and type-only edges can be told apart in one run.
    tsPreCompilationDeps: "specify",
    tsConfig: { fileName: "tsconfig.depcruise.json" },
    moduleSystems: ["es6", "cjs"],
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default", "types"],
      extensions: [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json"],
    },
    skipAnalysisNotInRules: false,
    reporterOptions: {
      dot: {
        theme: {
          graph: { rankdir: "LR" },
          dependencies: [
            { criteria: { dependencyTypes: "type-only" }, attributes: { style: "dashed", penwidth: 1.2 } },
            { criteria: { dependencyTypes: "dynamic-import" }, attributes: { style: "dotted" } },
          ],
        },
      },
      archi: { collapsePattern: "^(packages/[^/]+|apps/[^/]+)" },
    },
  },
};
