import { TestProvision } from "^jarun";
import { getReactUseWs_test } from "^tests/_fixture";
import { poll } from "^yapu";
import { assertEq } from "^jab";

//unmount after connection is established

export default async (prov: TestProvision) => {
  let { render, waitForAllClosed } = getReactUseWs_test(prov);

  const parent = render();

  const { unmount, acceptConnection } = parent.renderSub();

  assertEq(parent.rerender().wsState, "connecting");

  acceptConnection.resolve();

  await poll(() => parent.rerender().wsState === "connected");

  unmount();

  return waitForAllClosed();
};
