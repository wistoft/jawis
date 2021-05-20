import { getAbsConfigFilePath, getTsPathsConfig } from "^jacs";
import { TestProvision } from "^jarun";

// when no paths, return undefined

export default async (prov: TestProvision) => {
  prov.eq(undefined, getTsPathsConfig({}, getAbsConfigFilePath(__dirname)));
};
