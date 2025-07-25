import { capture, tos, captureLongStack } from "^jab";

/**
 *
 */
export const makeJarunEqAssertation = (exp: unknown, cur: unknown) => {
  const error = new Error("JarunEqAssertation: " + tos(exp) + ", " + tos(cur));

  const clonedExp = capture(exp);
  const clonedCur = capture(cur);

  /**
   *
   */
  const getJarunEqAssertationData = () => ({
    exp: clonedExp,
    cur: clonedCur,
    stack: captureLongStack(error),
  });

  Object.defineProperty(error, "getJarunEqAssertationData", {
    value: getJarunEqAssertationData,
    enumerable: false,
    configurable: true,
  });

  return error;
};
