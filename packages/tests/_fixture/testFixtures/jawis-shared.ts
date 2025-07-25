import {
  assert,
  FinallyFunc,
  TypedArray,
  TypedArrayContructor,
  tos,
  err,
  getRandomInteger,
} from "^jab";
import { TestProvision } from "^jarun";
import { BeeMain, BeeProvAndData } from "^bee-common";
import { WaitFunc } from "^jab";

import {
  SharedChunkHeapDeps,
  SharedChunkHeap,
  SharedDoublyLinkedListDeps,
  SharedDoublyLinkedList,
  SharedValidityVector,
  SharedValidityVectorDeps,
  HeapFactory,
  FixedSizeHeap,
  DataNode,
} from "^shared-algs";
import {
  Uint32TreeMap,
  Uint32TreeSet,
  Uint32TreeSetDeps,
  Uint32TreeMapDeps,
} from "^shared-tree/internal";
import {
  SharedDynamicMap,
  SharedDynamicMapDeps,
} from "^shared-dynamic-map/internal";
import {
  SharedListHeap,
  SharedListHeapDeps,
  SharedTreeHeap,
  SharedTreeHeapDeps,
} from "^shared-page-heap/internal";

import {
  AppendOnlyBufferStore,
  AppendOnlyBufferStoreDeps,
} from "^shared-buffer-store";
import {
  ReadWriteLockDeps,
  ReadWriteLock,
  SharedLockBytes,
} from "^shared-lock";
import { runLiveJacsBee_lazy } from ".";

/**
 *
 */
export const getAppendOnlyBufferStore = (
  prov: { finally: FinallyFunc },
  extra?: Partial<AppendOnlyBufferStoreDeps>
) => {
  const direction = getRandomInteger(1) === 1 ? "left" : "right";

  const byteSize = extra?.byteSize ?? 100;

  const sharedArray = new Uint8Array(new SharedArrayBuffer(byteSize));

  const store = new AppendOnlyBufferStore({
    sharedArray,
    byteSize,
    direction,
    timeout: 100,
    softTimeout: 50,
    finally: prov.finally,
    wait: makeWaitCircuitBreaker(),
    ...extra,
  });

  return store;
};

/**
 *
 */
export const getSharedDynamicMap = (
  prov: TestProvision,
  extra?: Partial<SharedDynamicMapDeps>,
  _byteSize?: number
) => {
  const byteSize = _byteSize ?? 1000;

  const sharedArray = new Uint8Array(new SharedArrayBuffer(byteSize));

  return new SharedDynamicMap({
    heapFactory: makeHeapFactory_test(prov),
    bufferStore: new AppendOnlyBufferStore({
      sharedArray,
      byteSize,
      direction: "left",
      timeout: 100,
      softTimeout: 50,
      finally: prov.finally,
      wait: makeWaitCircuitBreaker(),
      ...extra,
    }),
    timeout: 100,
    softTimeout: 50,
    finally: prov.finally,
    wait: makeWaitCircuitBreaker(),
    verifyAfterOperations: true,
    ...extra,
  });
};

/**
 *
 */
export const getSharedValidityVector = (
  prov: TestProvision,
  extra?: Partial<SharedValidityVectorDeps>
) => {
  const size = 256;

  return new SharedValidityVector({
    size,
    sharedArray: new Int32Array(
      new SharedArrayBuffer(SharedValidityVector.getExpectedByteSize(size))
    ),
    useChunkVersion: true,
    ...extra,
  });
};

/**
 *
 */
export const makeHeapFactory_test = (
  prov: {
    finally: FinallyFunc;
  },
  _packedHeaps?: [[number, any]]
): HeapFactory => {
  const heaps: Map<number, FixedSizeHeap> = new Map();

  const packedHeaps = new Map(_packedHeaps);

  return {
    pack: () =>
      Array.from(heaps.entries()).map(([dataSize, heap]) => [
        dataSize,
        heap.pack(),
      ]),
    get: (dataSize) => {
      let heap = heaps.get(dataSize);

      if (!heap) {
        const extra = packedHeaps?.get(dataSize) ?? {};
        //this is also possible. But it might be to complicated to debug.
        // heap = getSharedTreeHeap(prov, { maxSize: 100, dataSize });
        heap = getSharedListHeap(prov, { maxSize: 100, dataSize, ...extra });
        // heap = makeInMemoryPageHeap(prov, dataSize);
        heaps.set(dataSize, heap);
      }

      return heap;
    },
  };
};

/**
 * use makeInHeapFactory most of the time
 */
export const makeInMemoryPageHeap = (
  prov: { finally: FinallyFunc },
  dataSize: number
): FixedSizeHeap => {
  let refMax = -1;
  const map = new Map<number, TypedArray>();

  //ensure clean up

  prov.finally(() => {
    assert(map.size === 0, "InMemoryPagedHeap should be empty when test ends, count: " +  map.size, {map} ); // prettier-ignore
  });

  /**
   *
   *
   */
  return {
    dataSize,

    pack: () => {
      throw new Error("Can't pack");
    },

    get count() {
      return map.size;
    },

    /**
     * todo: it will not return the right type. It will return the one that was created.
     */
    get: <T extends TypedArray>(
      ref: number,
      _TypedArray: TypedArrayContructor<T>
    ) => {
      const val = map.get(ref) as any;

      if (val === undefined) {
        err("Reference isn't valid: ", { ref });
      }

      return val;
    },

    /**
     *
     * note: zerofill isn't necessary.
     */
    allocate: <T extends TypedArray>(
      TypedArray: TypedArrayContructor<T>,
      _zeroFill = true
    ) => {
      refMax++;

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
        err("Reference isn't valid: ", { ref });
      }
    },

    /**
     *
     */
    toString: () => tos(map),
  };
};

/**
 *
 */
export const getSharedTreeHeap = (
  prov: TestProvision,
  extra?: Partial<SharedTreeHeapDeps>
) => {
  const maxSize = extra?.maxSize ?? 4;
  const dataSize = extra?.dataSize ?? 8;

  const heap = new SharedTreeHeap({
    maxSize,
    dataSize,
    sharedArray: new Int32Array(
      new SharedArrayBuffer(
        SharedTreeHeap.getExpectedByteSize(maxSize, dataSize)
      )
    ),
    useChunkVersion: true,
    ...extra,
  });

  prov.finally(() => {
    assert(heap.count === 0, "SharedPageHeap should be empty when test ends, count: " +  heap.count ); // prettier-ignore
  });

  return heap;
};

/**
 *
 */
export const getSharedListHeap = (
  prov: { finally: FinallyFunc },
  extra?: Partial<SharedListHeapDeps>
) => {
  const maxSize = extra?.maxSize ?? 4;
  const dataSize = extra?.dataSize ?? 8;

  const heap = new SharedListHeap({
    maxSize,
    dataSize,
    sharedArray: new Int32Array(
      new SharedArrayBuffer(
        SharedListHeap.getExpectedByteSize(maxSize, dataSize)
      )
    ),
    verifyAfterOperations: true,
    ...extra,
  });

  prov.finally(() => {
    assert(heap.count === 0, "SharedListHeap should be empty when test ends, count: " +  heap.count ); // prettier-ignore
  });

  return heap;
};

/**
 *
 */
export const getSharedChunkHeap = (
  prov: TestProvision,
  extra?: Partial<SharedChunkHeapDeps & { pageSize: number }>
) => {
  const dataSize = extra?.pageSize ?? 8;
  const pageSize = extra?.pageSize ?? 64;

  const heap = new SharedChunkHeap({
    heapFactory: makeHeapFactory_test(prov),
    pageSize,
    dataSize,
    verifyAfterOperations: true,
    ...extra,
  });

  prov.finally(() => {
    assert(heap.count === 0, "SharedChunkHeap should be empty when test ends, count: " +  heap.count ); // prettier-ignore
  });

  return heap;
};

/**
 *
 */
export const getSharedChunkHeap_2_chuncks_per_page = (
  prov: TestProvision,
  extra?: Partial<SharedChunkHeapDeps & { pageSize: number }>
) => {
  const chunkedHeap = getSharedChunkHeap(prov, {
    pageSize: 80,
    dataSize: 24,
    ...extra,
  });

  assert(chunkedHeap.CHUNKS_PER_NODE === 2);

  return chunkedHeap;
};

/**
 * Seems to give problems some times.
 *  - And it's not a bug to wait many times.
 */
export const makeWaitCircuitBreaker = (): WaitFunc => {
  // const i = 1;
  return (arr, index, value, timeout) => {
    // if (i % 100 === 0) {
    //   console.log("Many waits: " + i);
    // }
    // if (i++ > 1000) {
    //   throw new Error("Too many waits: " + i);
    // }
    return Atomics.wait(arr, index, value, timeout);
  };
};

/**
 *
 */
export const getLock = (
  prov: TestProvision,
  extra?: Partial<ReadWriteLockDeps<any>>
) =>
  new ReadWriteLock({
    sharedArray: new Int32Array(new SharedArrayBuffer(SharedLockBytes)),
    type: "my-lock",
    softTimeout: 10,
    timeout: 100,
    finally: prov.finally,
    wait: makeWaitCircuitBreaker(),
    ...extra,
  });

/**
 *
 */
export const getUint32TreeSet = (
  prov: TestProvision,
  extra?: Partial<Uint32TreeSetDeps>
) =>
  new Uint32TreeSet({
    heapFactory: makeHeapFactory_test(prov),
    verifyAfterOperations: true,
    ...extra,
  });

/**
 *
 */
export const getUint32TreeMap = (
  prov: TestProvision,
  extra?: Partial<Uint32TreeMapDeps>
) =>
  new Uint32TreeMap({
    heapFactory: makeHeapFactory_test(prov),
    verifyAfterOperations: true,
    ...extra,
  });

/**
 *
 */
export const getSharedDoublyLinkedList = (
  prov: TestProvision,
  extra: Partial<SharedDoublyLinkedListDeps<DataNode>> = {}
) => {
  const pageSize = 32;

  const list = new SharedDoublyLinkedList({
    heapFactory: makeHeapFactory_test(prov),
    dataSize: SharedDoublyLinkedList.getDataAvailable(pageSize),
    makeNode: (x) => x,
    verifyAfterOperations: true,
    ...extra,
  });

  //ensure clean up

  prov.finally(() => {
    assert(list.count === 0, "SharedDoublyLinkedList should be empty when test ends, count: " +  list.count ); // prettier-ignore
  });

  return list;
};

/**
 *
 */
export const startOtherLock = (
  prov: TestProvision,
  filename: string,
  lock: ReadWriteLock<any>,
  onMessage?: () => void
) =>
  runLiveJacsBee_lazy(prov, filename, lock.pack(), {
    onMessage,
  });

/**
 *
 */
export const makeLockMain =
  (
    testMain: (lock: ReadWriteLock<any>, prov: BeeProvAndData) => void
  ): BeeMain<any, ReturnType<ReadWriteLock<any>["pack"]>> =>
  (prov) => {
    if (!prov.beeData) {
      throw new Error("missing data.");
    }

    const lock = new ReadWriteLock({
      ...prov.beeData,
      finally: () => {},
      DateNow: () => 1,
    });

    testMain(lock, prov);
  };

/**
 *
 */
export const makeSharedTreeHeapMain =
  (
    testMain: (heap: SharedTreeHeap, prov: BeeProvAndData<any, any>) => void
  ): BeeMain<any, { heap: ReturnType<SharedTreeHeap["pack"]> }> =>
  (prov) => {
    if (!prov.beeData) {
      throw new Error("missing data.");
    }

    const heap = new SharedTreeHeap(prov.beeData.heap);

    testMain(heap, prov);
  };

/**
 *
 */
export const makeSharedListHeapMain =
  (
    testMain: (heap: SharedListHeap, prov: BeeProvAndData<any, any>) => void
  ): BeeMain<any, { heap: ReturnType<SharedListHeap["pack"]> }> =>
  (prov) => {
    if (!prov.beeData) {
      throw new Error("missing data.");
    }

    const heap = new SharedListHeap(prov.beeData.heap);

    testMain(heap, prov);
  };

/**
 *
 */
export const makeSharedDynamicMap =
  (
    testMain: (map: SharedDynamicMap, prov: BeeProvAndData<any, any>) => void
  ): BeeMain<any, { pack: ReturnType<SharedDynamicMap["pack"]> }> =>
  (prov) => {
    if (!prov.beeData) {
      throw new Error("missing data.");
    }

    const testProv = { finally: () => {} };

    const bufferPack = prov.beeData.pack.bufferStorePack as ReturnType< AppendOnlyBufferStore["pack"] >; // prettier-ignore

    const bufferStore = getAppendOnlyBufferStore(testProv, bufferPack); // prettier-ignore

    const heapFactoryPack = prov.beeData.pack.heapFactoryPack as any;

    const heapFactory = makeHeapFactory_test(testProv, heapFactoryPack);

    const heap = new SharedDynamicMap({
      bufferStore,
      heapFactory,
      timeout: 100,
      softTimeout: 50,
      finally: testProv.finally,
      wait: makeWaitCircuitBreaker(),
      ...prov.beeData.pack,
    });

    testMain(heap, prov);
  };
