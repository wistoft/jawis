import path from "path";

/**
 *
 */
export const doit = async () => {
  require(path.join(__dirname, "./lint-fix-package-json.ts"));
  require(path.join(__dirname, "./lint-fix-prune-testlogs.ts"));
  require(path.join(__dirname, "./lint-packages.ts"));
};

doit();
