import { getTsPathsConfig } from "^jacs";
import { TestProvision } from "^jarun";

export default async (prov: TestProvision) => {
  getTsPathsConfig({}, "dontExist");
};
