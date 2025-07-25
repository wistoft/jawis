import { AbsoluteFile } from "^jab";
import { TestProvision } from "^jarun";
import { getPackageCollection } from "^tests/_fixture/index";

//cache is used when supplied

export default (prov: TestProvision) => {
  const { col } = getPackageCollection(prov, {
    cache: {
      diagnoticsCache: new Map([
        [
          "package1",
          [{ file: "" as AbsoluteFile, message: "something is wrong" }],
        ],
      ]),
      referenceCache: new Map([["package1", new Set()]]),
      packages: [
        {
          id: "package1",
          data: "cache data",
        },
      ],
    },
  });

  prov.imp(col.getCache());
};
