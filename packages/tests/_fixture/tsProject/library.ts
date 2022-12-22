/* eslint-disable unused-imports/no-unused-vars */

export const returnSomething = () => {
  return "returnSomething";
};

export const saySomething = (): void => {
  console.log("saySomething");
};

/**
 * my class
 */
export class MyClass {
  /**
   * my constructor
   *
   */
  public constructor(myVar = "") {}

  /**
   * my method
   */
  public myMethod: () => number = () => 1;
}
