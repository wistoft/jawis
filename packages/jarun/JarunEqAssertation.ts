import {
  capture,
  CapturedValue,
  tos,
  fixErrorInheritence,
  captureStack,
} from "^jab";

/**
 *
 */
export class JarunEqAssertation extends Error {
  public readonly name: string = "JarunEqAssertation";
  private exp: CapturedValue;
  private cur: CapturedValue;

  constructor(exp: unknown, cur: unknown) {
    super("JarunEqAssertation: " + tos(exp) + ", " + tos(cur));

    this.exp = capture(exp);
    this.cur = capture(cur);

    fixErrorInheritence(this, JarunEqAssertation.prototype);
  }

  /**
   *
   */
  public getSomething() {
    return {
      exp: this.exp,
      cur: this.cur,
      stack: captureStack(this),
    };
  }
}
