import { TestProvision } from "^jarun";
import { getPackageCollection } from "^tests/_fixture/index";

//state is set correctly, when there's no cache

export default (prov: TestProvision) => {
  const { col } = getPackageCollection(prov);

  prov.imp(col.getCache());
};
