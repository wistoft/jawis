import StackTrace from "stacktrace-js";
import {
  base64ToBinary,
  binaryToBase64,
  err,
  JabError,
  UnparsedStack,
} from "^jab";
import { HookSetState, PartialStateUpdater2 } from "^jab-react";

import { getTestIdx } from "^jatev/TestCollection";
import { parseTrace, parseTraceAndSourceMap } from "^jawis-util/web";

export default () => {
  entry();
};

export const entry = () => {
  const setState = () => {
    throw new Error("ups");
  };

  trouble(setState)({ hej: 1 });
};

export const trouble = <S>(setState: HookSetState<S>) => (
  updater: PartialStateUpdater2<S>
) => {
  if (typeof updater === "object") {
    setState((old) => ({ ...old, ...updater }));
  } else {
    setState((old) => ({ ...old, ...updater(old) }));
  }
};
