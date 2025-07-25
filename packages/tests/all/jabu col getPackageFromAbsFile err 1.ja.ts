import { TestProvision } from "^jarun";
import { getPackageCollection } from "^tests/_fixture/index";

//file outside all packages

export default async (prov: TestProvision) => {
  const { col } = getPackageCollection(prov);

  col.getPackageFromAbsFile("/not-a-package");
};
