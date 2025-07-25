import { TestProvision } from "^jarun";
import { getPackageCollection } from "^tests/_fixture/index";

//when there is diagnostics

export default async (prov: TestProvision) => {
  const { col } = getPackageCollection(prov);

  prov.imp(await col.getPackageOutputFromId("package1"));
};
