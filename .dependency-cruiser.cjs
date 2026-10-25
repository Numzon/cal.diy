const path = require("node:path");

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      comment:
        "Circular dependencies break build order and make modules impossible to test in isolation. " +
        "Extract the shared code into a lower-level module that both sides can import.",
      from: {},
      to: { circular: true },
    },
    {
      name: "not-to-unresolvable",
      severity: "warn",
      comment:
        "This module depends on something that cannot be resolved. Either the import is wrong, a dependency is " +
        "missing from package.json, or generated code is missing (run `yarn prisma generate` / `yarn app-store:build`).",
      from: {},
      to: { couldNotResolve: true },
    },
    {
      name: "no-deprecated-core",
      severity: "warn",
      comment: "This module depends on a deprecated node core module. Use its replacement.",
      from: {},
      to: { dependencyTypes: ["core"], path: "^(punycode|domain|constants|sys|_linklist|_stream_wrap)$" },
    },
    {
      name: "not-to-spec",
      severity: "error",
      comment:
        "Test files must not be imported by non-test code. If both need the same code, extract it into a shared module.",
      from: { pathNot: "\\.(spec|test|e2e-spec|integration-test)\\.[cm]?[jt]sx?$" },
      to: { path: "\\.(spec|test|e2e-spec|integration-test)\\.[cm]?[jt]sx?$" },
    },

    // Package layering - see agents/rules/architecture-circular-dependencies.md
    // (lib -> app-store -> features -> trpc -> apps/web, never the other way around).
    {
      name: "lib-not-to-higher-layers",
      severity: "error",
      comment:
        "packages/lib is the lowest layer. It must not import from app-store, features, trpc or @trpc/server.",
      from: { path: "^packages/lib/" },
      to: { path: ["^packages/(app-store|features|trpc)/", "^node_modules/@trpc/server/"] },
    },
    {
      name: "app-store-not-to-higher-layers",
      severity: "error",
      comment: "packages/app-store must not import from features or trpc.",
      from: { path: "^packages/app-store/" },
      to: { path: "^packages/(features|trpc)/" },
    },
    {
      name: "features-not-to-higher-layers",
      severity: "error",
      comment: "packages/features must not import from trpc or apps/web.",
      from: { path: "^packages/features/" },
      to: { path: "^(packages/trpc|apps/web)/" },
    },
    {
      name: "trpc-not-to-web",
      severity: "error",
      comment: "packages/trpc must not import from apps/web.",
      from: { path: "^packages/trpc/" },
      to: { path: "^apps/web/" },
    },
    {
      name: "testing-not-to-web-or-features",
      severity: "error",
      comment: "packages/testing must not import from apps/web or packages/features.",
      from: { path: "^packages/testing/" },
      to: { path: "^(apps/web|packages/features)/" },
    },
    {
      name: "atoms-not-to-trpc-or-web",
      severity: "error",
      comment: "packages/platform/atoms must not import from packages/trpc or apps/web.",
      from: { path: "^packages/platform/atoms/" },
      to: { path: "^(packages/trpc|apps/web)/" },
    },
  ],
  options: {
    // Do not walk into npm packages - we only want to know that they are used.
    doNotFollow: { path: "node_modules" },

    // Build output and tool caches are not source code.
    exclude: {
      path: "(^|/)(\\.next|\\.turbo|dist|coverage)(/|$)",
    },

    // Count `import type` edges: the layering rules above apply to type imports too.
    tsPreCompilationDeps: true,

    // apps/web/tsconfig.json carries the `~/*`, `@components/*`, `@lib/*`... path aliases.
    // @calcom/* packages are resolved through the workspace symlinks in node_modules.
    tsConfig: { fileName: path.join(__dirname, "apps", "web", "tsconfig.json") },

    moduleSystems: ["cjs", "es6"],

    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default", "types"],
      mainFields: ["module", "main", "types", "typings"],
    },

    reporterOptions: {
      dot: {
        collapsePattern: "^(?:packages|apps)/[^/]+|node_modules/(?:@[^/]+/[^/]+|[^/]+)",
      },
      archi: {
        collapsePattern: "^(?:packages|apps)/[^/]+|node_modules/(?:@[^/]+/[^/]+|[^/]+)",
      },
      text: {
        highlightFocused: true,
      },
    },
  },
};
