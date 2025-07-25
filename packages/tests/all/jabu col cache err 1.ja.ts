import { TestProvision } from "^jarun";
import { getPackageCollection_empty } from "^tests/_fixture/index";

//cache has entry for package, that doesn't exist.

export default (prov: TestProvision) => {
  getPackageCollection_empty(prov, {
    cache: { packages: [{ id: "fido", data: {} }] },
  });
};
