import path from "node:path";
import { BeeMain } from "^bee-common/types";
import { getBeeProv } from "^bee-node/bee-node";
import { AbsoluteFile } from "^jab";

/**
 *
 */
export const main: BeeMain = async (prov) => {
  await prov.runBee({ filename: path.join(__dirname, "./lint-fix-imports.ts") as AbsoluteFile}, false); // prettier-ignore
  await prov.runBee({ filename: path.join(__dirname, "./lint-fix-imports-with-ts-morph.ts") as AbsoluteFile}, false); // prettier-ignore
  await prov.runBee({ filename: path.join(__dirname, "./lint-fix-package-files.ts") as AbsoluteFile}, false); // prettier-ignore
  await prov.runBee({ filename: path.join(__dirname, "./lint-fix-prune-testlogs.ts") as AbsoluteFile}, false); // prettier-ignore
  await prov.runBee({ filename: path.join(__dirname, "./lint-fix-root-tsconfig.ts") as AbsoluteFile}, false); // prettier-ignore
  await prov.runBee({ filename: path.join(__dirname, "./lint-fix-test-prefixes.ts") as AbsoluteFile}, false); // prettier-ignore
  await prov.runBee({ filename: path.join(__dirname, "./lint-packages.ts") as AbsoluteFile}, false); // prettier-ignore
};

//run if not run by bee-manager

if (!(global as any)._jawis_bee_prov) {
  const prov = getBeeProv("dummy-token", false);

  main({ ...prov, beeData: undefined });
}
