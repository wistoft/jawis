import { AbsoluteFile } from "^jabc";
import { TestProvision } from "^jarun";
import { getPackageCollection } from "^tests/_fixture/index";

//file change between diagnostics and output

export default async (prov: TestProvision) => {
  const { col, packages } = getPackageCollection(prov);

  const pack = packages.get("package1")!;

  //1

  prov.log("have dianostics", await col.getPackageOutputFromId("package1"));

  //2

  col.onFileChange("/package1/whatever");
  pack.diagnostics = [];

  prov.log("have output", await col.getPackageOutputFromId("package1"));

  //3

  col.onFileChange("/package1/whatever");
  pack.diagnostics = [{ file: "" as AbsoluteFile, message: "not again!!" }];

  prov.log(
    "have dianostics again",
    await col.getPackageOutputFromId("package1")
  );
};
