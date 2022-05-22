import { TestProvision } from "^jarun";
import { getSharedBufferStore } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const { store } = getSharedBufferStore(prov, {
    direction: "left",
  });

  //
  // alignment 1
  //

  prov.eq(0, store.header.getLeftPadding(10, 4, 1));
  prov.eq(0, store.header.getLeftPadding(11, 4, 1));
  prov.eq(0, store.header.getLeftPadding(12, 4, 1));

  prov.eq(0, store.header.getLeftPadding(10, 5, 1));
  prov.eq(0, store.header.getLeftPadding(10, 6, 1));

  //
  // alignment 2
  //

  prov.eq(0, store.header.getLeftPadding(10, 6, 2));
  prov.eq(1, store.header.getLeftPadding(10, 7, 2));
  prov.eq(0, store.header.getLeftPadding(10, 8, 2));
  prov.eq(1, store.header.getLeftPadding(10, 9, 2));

  //
  // alignment 4
  //

  prov.eq(1, store.header.getLeftPadding(10, 1, 4));
  prov.eq(0, store.header.getLeftPadding(10, 2, 4));
  prov.eq(3, store.header.getLeftPadding(10, 3, 4));
  prov.eq(2, store.header.getLeftPadding(10, 4, 4));
  prov.eq(1, store.header.getLeftPadding(10, 5, 4));
};
