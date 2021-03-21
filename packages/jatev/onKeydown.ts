import { assertNever, EventStream } from "^jab";

import { ClientMessage, ServerMessage } from "^jatec";

type Deps = {
  onCloseTestCase: () => void;
  onPrev: () => void;
  onNext: () => void;
  onRunCurrentTest: () => void;
  onEditCurrentTest: () => void;
  apiSend: (data: ClientMessage) => void;
};

/**
 *
 */
export const makeOnKeydown = (deps: Deps) => (e: KeyboardEvent) => {
  switch (e.key) {
    case "Escape":
      deps.onCloseTestCase();
      break;
    case "p":
      deps.onPrev();
      break;
    case "n":
      deps.onNext();
      break;
    case "a":
      // deps.apiSend({ action: "runAllTests" });
      break;
    case "s":
      deps.apiSend({ action: "stopRunning" });
      break;
    case "r":
      deps.onRunCurrentTest();
      break;
    case "e":
      deps.onEditCurrentTest();
      break;
    default:
      break;
  }
};
