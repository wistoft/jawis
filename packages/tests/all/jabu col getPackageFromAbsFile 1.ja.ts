import { TestProvision } from "^jarun";
import { getPackageCollection } from "^tests/_fixture/index";

//it's a new file to the package.

export default async (prov: TestProvision) => {
  const { col } = getPackageCollection(prov);

  prov.eq("package1", col.getPackageFromAbsFile("/package1/new-file").id);
};
