import { getTsPathsConfig } from "^ts-config-util";
import { TestProvision } from "^jarun";

export default async (prov: TestProvision) => {
  getTsPathsConfig({}, "dontExist");
};
