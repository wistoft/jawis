import { TypedArrayContructor } from "^jab";
import { FixedSizeHeap } from "./SharedUtil";

export type PowerHeapDeps = {
  heap: FixedSizeHeap;
  dataSize: number;
};

/**
 *
 *
 */
export class PowerHeap {
  /**
   *
   */
  constructor(private deps: PowerHeapDeps) {}

  /**
   *
   */
  public get = <T extends Int32Array>(
    ref: number,
    TypedArray: TypedArrayContructor<T>
  ) => {
    throw new Error("not impl");
  };

  /**
   *
   */
  public allocate = <T extends Int32Array>(
    TypedArray: TypedArrayContructor<T>,
    zeroFill?: boolean
  ) => {
    throw new Error("not impl");
  };

  /**
   *
   */
  public deallocate = (ref: number) => {
    throw new Error("not impl");
  };
}
