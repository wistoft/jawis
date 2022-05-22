import { TestProvision } from "^jarun";
import { getSharedBufferStore } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const { store } = getSharedBufferStore(prov, {
    direction: "right",
  });

  const data1 = {
    accessCount: 1,
    deleted: false,
    ref: 2,
    dataLength: 3,
    alignment: 1,
  };

  const data2 = { ...data1, alignment: 2 };
  const data4 = { ...data1, alignment: 4 };

  prov.eq(store.header.prepare(0, data1), store.header.prepare(0, data1)) // prettier-ignore
  prov.eq(store.header.prepare(0, data1), store.header.prepare(1, data1)) // prettier-ignore
  prov.eq(store.header.prepare(0, data1), store.header.prepare(2, data1)) // prettier-ignore
  prov.eq(store.header.prepare(0, data1), store.header.prepare(4, data1)) // prettier-ignore

  prov.log("alignment to 2 (index 0)", store.header.prepare(0, data2));
  prov.log("alignment to 2 (index 1)", store.header.prepare(1, data2));
  prov.log("alignment to 2 (index 2)", store.header.prepare(2, data2));

  prov.log("alignment to 4 (index 0)", store.header.prepare(0, data4));
  prov.log("alignment to 4 (index 1)", store.header.prepare(1, data4));
  prov.log("alignment to 4 (index 2)", store.header.prepare(2, data4));
  prov.log("alignment to 4 (index 4)", store.header.prepare(4, data4));
  prov.log("alignment to 4 (index 3)", store.header.prepare(3, data4));
};
