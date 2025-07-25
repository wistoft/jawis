import { TestProvision } from "^jarun";
import { getPackageCollection } from "^tests/_fixture/index";

//when there's no diagnostics

export default async (prov: TestProvision) => {
  const { col, packages } = getPackageCollection(prov);

  const pack = packages.get("package1")!;
  pack.diagnostics = [];

  prov.imp(await col.getPackageOutputFromId("package1"));
};
