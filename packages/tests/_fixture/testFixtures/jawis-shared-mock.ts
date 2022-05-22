import { err, tos, TypedArray, TypedArrayContructor, assert } from "^jab";

import { TestProvision } from "^jarun";

import { FixedSizeHeap, MakeHeap, TreeMap } from "^jab-node";

/**
 *
 */
export const makeMakeHeap =
  (prov: TestProvision): MakeHeap =>
  (dataSize: number) =>
    getInMemoryPagedHeap(prov, dataSize);

/**
 *
 */
export const getInMemoryPagedHeap = (
  prov: TestProvision,
  dataSize: number
): FixedSizeHeap => {
  let refMax = -1;
  const map = new Map<number, TypedArray>();

  //ensure clean up

  prov.finally(() => {
    assert(map.size === 0, "InMemoryPagedHeap should be empty when test ends, count: " +  map.size ); // prettier-ignore
  });

  /**
   *
   *
   */
  return {
    dataSize,
    get count() {
      return map.size;
    },

    /**
     * todo: it will not return the right type. It will return the one that was created.
     */
    get: <T extends TypedArray>(
      ref: number,
      TypedArray: TypedArrayContructor<T>
    ) => {
      const val = map.get(ref) as any;

      if (val === undefined) {
        throw new Error("Ref not found: " + ref);
      }

      return val;
    },

    /**
     *
     * note: zerofill isn't necessary.
     */
    allocate: <T extends TypedArray>(
      TypedArray: TypedArrayContructor<T>,
      zeroFill = true
    ) => {
      refMax++;

      //todo
      const array = new TypedArray(dataSize / TypedArray.BYTES_PER_ELEMENT);

      map.set(refMax, array);

      return { ref: refMax, array };
    },

    /**
     *
     */
    deallocate: (ref: number) => {
      const val = map.delete(ref);

      if (!val) {
        throw new Error("Ref not found: " + ref);
      }
    },

    /**
     *
     */
    toString: () => tos(map),
  };
};
