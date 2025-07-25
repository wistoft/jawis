import { TestProvision } from "^jarun";
import { getReactUseWs_test } from "^tests/_fixture";
import { assertEq } from "^jab";

//unmount before connection is established

export default async (prov: TestProvision) => {
  let { render, waitForAllClosed } = getReactUseWs_test(prov);

  const parent = render();

  const { unmount, acceptConnection } = parent.renderSub();

  assertEq(parent.rerender().wsState, "connecting");

  unmount();

  assertEq(parent.rerender().wsState, "closed"); // is only logically closed

  acceptConnection.resolve();

  return waitForAllClosed();
};
