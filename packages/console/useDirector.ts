import { useState } from "react";

import { getRandomInteger } from "^jab";

import { useConsoleState, makeUseConsoleStream } from "./internal";

/**
 *
 */
export const useDirector = () => {
  // state

  const state = useConsoleState(getRandomInteger);

  //listen to console data from the browser.

  const [useConsoleStream] = useState(makeUseConsoleStream);

  useConsoleStream((entries) => state.addData(entries, true));

  // done

  return { ...state, openFile };
};

/**
 * Is there a way to have the browser open files?
 */
const openFile = () => {};
