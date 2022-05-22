import { clone, tos, captureStack } from "^jab";

/**
 *
 */
export const makeJarunEqAssertation = (exp: unknown, cur: unknown) => {
  const error = new Error("JarunEqAssertation: " + tos(exp) + ", " + tos(cur));

  const clonedExp = clone(exp);
  const clonedCur = clone(cur);

  /**
   *
   */
  const getJarunEqAssertationData = () => ({
    exp: clonedExp,
    cur: clonedCur,
    stack: captureStack(error),
  });

  Object.defineProperty(error, "getJarunEqAssertationData", {
    value: getJarunEqAssertationData,
    enumerable: false,
    configurable: true,
  });

  return error;
};
