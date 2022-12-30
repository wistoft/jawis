import path from "path";

/**
 *
 */
export const doit = async () => {
  require(path.join(__dirname, "./lint-fix-imports.ts"));
  require(path.join(__dirname, "./lint-fix-package-files.ts"));
  require(path.join(__dirname, "./lint-fix-prune-testlogs.ts"));
  require(path.join(__dirname, "./lint-fix-root-tsconfig.ts"));
  require(path.join(__dirname, "./lint-packages.ts"));
};

doit();
