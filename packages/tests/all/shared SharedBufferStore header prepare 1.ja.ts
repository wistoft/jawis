import { TestProvision } from "^jarun";
import { getAppendOnlyBufferStore } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const store = getAppendOnlyBufferStore(prov, {
    direction: "right",
  });

  const data1 = {
    version: 2,
    bufferLength: 3,
    alignment: 1,
  };

  const data2 = { ...data1, alignment: 2 };
  const data4 = { ...data1, alignment: 4 };

  prov.eq(store.headerUtil.prepare(0, data1), store.headerUtil.prepare(0, data1)) // prettier-ignore
  prov.eq(store.headerUtil.prepare(0, data1), store.headerUtil.prepare(1, data1)) // prettier-ignore
  prov.eq(store.headerUtil.prepare(0, data1), store.headerUtil.prepare(2, data1)) // prettier-ignore
  prov.eq(store.headerUtil.prepare(0, data1), store.headerUtil.prepare(4, data1)) // prettier-ignore

  prov.log("alignment to 2 (index 0)", store.headerUtil.prepare(0, data2));
  prov.log("alignment to 2 (index 1)", store.headerUtil.prepare(1, data2));
  prov.log("alignment to 2 (index 2)", store.headerUtil.prepare(2, data2));

  prov.log("alignment to 4 (index 0)", store.headerUtil.prepare(0, data4));
  prov.log("alignment to 4 (index 1)", store.headerUtil.prepare(1, data4));
  prov.log("alignment to 4 (index 2)", store.headerUtil.prepare(2, data4));
  prov.log("alignment to 4 (index 4)", store.headerUtil.prepare(4, data4));
  prov.log("alignment to 4 (index 3)", store.headerUtil.prepare(3, data4));
};
