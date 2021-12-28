import {
  clone,
  ClonedValue,
  tos,
  fixErrorInheritance,
  captureStack,
} from "^jab";

/**
 *
 */
export class JarunEqAssertation extends Error {
  public readonly name: string = "JarunEqAssertation";
  private exp: ClonedValue;
  private cur: ClonedValue;

  constructor(exp: unknown, cur: unknown) {
    super("JarunEqAssertation: " + tos(exp) + ", " + tos(cur));

    this.exp = clone(exp);
    this.cur = clone(cur);

    fixErrorInheritance(this, JarunEqAssertation.prototype);
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
