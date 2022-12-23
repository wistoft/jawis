import { getAbsConfigFilePath, getTsPathsConfig } from "^ts-config-util";
import { TestProvision } from "^jarun";

// when no paths, return undefined

export default async (prov: TestProvision) => {
  prov.eq(undefined, getTsPathsConfig({}, getAbsConfigFilePath(__dirname)));
};
