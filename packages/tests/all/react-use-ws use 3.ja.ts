import { TestProvision } from "^jarun";
import { getReactUseWs_test } from "^tests/_fixture";
import { poll } from "^yapu";
import { assertEq } from "^jab";

//second ws mounts before first contects

export default async (prov: TestProvision) => {
  let { render, waitForAllClosed } = getReactUseWs_test(prov);

  const parent = render();

  //first is unmounted before it reaches connected state.

  const child1 = parent.renderSub();

  assertEq(parent.rerender().wsState, "connecting");

  child1.unmount();

  assertEq(parent.rerender().wsState, "closed"); // is only logically closed

  //second is mounted and connects

  const child2 = parent.renderSub();

  assertEq(parent.rerender().wsState, "connecting");

  child2.acceptConnection.resolve();

  await poll(() => parent.rerender().wsState === "connected");

  //first connects

  child1.acceptConnection.resolve();

  await poll(
    () => parent.rerender().wsState === "closed",
    undefined,
    undefined,
    "Expected timeout"
  ).catch((error) => {
    //expected timeout here, because first must not interfere with the seconds state.
    prov.onError(error);
  });

  //unmount second to clean up

  child2.unmount();

  return waitForAllClosed();
};
