import { refable, BeeMain, assert, FinallyProvider } from "^jab";

import { TestProvision } from "^jarun";

import {
  Lock,
  LockDeps,
  WaitFunc,
  NLock,
  LockSharedArrayLength,
  SharedDynamicMap,
  SharedDynamicMapDeps,
  SharedBufferStore,
  SharedBufferStoreDeps,
  SharedPageHeap,
  SharedPageHeapDeps,
  SharedCompactBitTreeDeps,
  SharedCompactBitTree,
  SharedRedBlackTreeBaseDeps,
  SharedRedBlackTreeBase,
  SharedChunkHeapDeps,
  SharedChunkHeap,
  Uint32TreeMap,
  SharedDoublyLinkedListDeps,
  SharedDoublyLinkedList,
} from "^jab-node";
import { SharedBufferStoreLockSystem } from "^jab-node/SharedBufferStoreLockSystem";
import { getInMemoryPagedHeap, makeLiveJacs_lazy, makeMakeHeap } from ".";
import {
  SharedValidityVector,
  SharedValidityVectorDeps,
} from "^jab-node/SharedValidityVector";

/**
 *
 */
export const getSharedBufferStore = (
  prov: TestProvision,
  extra?: Partial<SharedBufferStoreDeps>
) => {
  const release = refable();

  const makeHeap = makeMakeHeap(prov);

  const store = new SharedBufferStore({
    byteSize: 100,
    direction: "right",
    makeHeap,
    timeout: 100,
    softTimeout: 50,
    finally: prov.finally,
    wait: makeWaitCircuitBreaker(),
    ...extra,
  });

  return { store, release };
};

/**
 *
 */
export const getSharedBufferStoreLockSystem = (prov: TestProvision) =>
  new SharedBufferStoreLockSystem({
    exclusiveLockSharedArray: new Int32Array(new SharedArrayBuffer(LockSharedArrayLength * 4)), // prettier-ignore
    metaWriteSharedArray: new Int32Array(new SharedArrayBuffer(LockSharedArrayLength * 4)), // prettier-ignore
    timeout: 100,
    softTimeout: 50,
    finally: prov.finally,
    wait: makeWaitCircuitBreaker(),
  });

/**
 *
 */
export const getSharedDynamicMap = (
  prov: TestProvision,
  extra?: Partial<SharedDynamicMapDeps>
) =>
  new SharedDynamicMap({
    makeHeap: makeMakeHeap(prov),
    byteSize: 1000,
    timeout: 100,
    softTimeout: 50,
    finally: prov.finally,
    wait: makeWaitCircuitBreaker(),
    ...extra,
  });

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
      new SharedArrayBuffer(SharedValidityVector.getExpectedBytesize(size))
    ),
    ...extra,
  });
};

/**
 *
 */
export const getSharedCompactBitTree = (
  prov: TestProvision,
  extra?: Partial<SharedCompactBitTreeDeps>
) => {
  const size = extra?.maxSize ?? 4;
  const dataSize = extra?.dataSize ?? 0;
  const byteSize = SharedCompactBitTree.getExpectedBytesize(size, dataSize);

  return new SharedCompactBitTree({
    maxSize: size,
    dataSize,
    byteSize,
    sharedArray: new Int32Array(new SharedArrayBuffer(byteSize)),
    ...extra,
  });
};

/**
 *
 */
export const getSharedPageHeap = (
  prov: TestProvision,
  extra?: Partial<SharedPageHeapDeps>
) => {
  const size = 2;
  const dataSize = 32;

  return new SharedPageHeap({
    size,
    dataSize,
    ...extra,
  });
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

  const heap = getSharedPageHeap(prov, {
    size: 100,
    dataSize: pageSize,
  });

  const chunkedHeap = new SharedChunkHeap({
    heap,
    dataSize,
    finally: prov.finally,
    ...extra,
  });

  prov.finally(() => {
    assert(chunkedHeap.count === 0, "SharedChunkHeap should be empty when test ends, count: " +  chunkedHeap.count ); // prettier-ignore
  });

  return chunkedHeap;
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
 */
export const makeWaitCircuitBreaker = (): WaitFunc => {
  let i = 0;
  return (arr, index, value, timeout) => {
    if (i++ > 10) {
      throw new Error("Too many waits: " + i);
    }
    return Atomics.wait(arr, index, value, timeout);
  };
};

/**
 *
 */
export const getLock = (prov: TestProvision, extra?: Partial<LockDeps<any>>) =>
  new Lock({
    sharedArray: new Int32Array(
      new SharedArrayBuffer(LockSharedArrayLength * 4)
    ),
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
export const getNLock = (prov: TestProvision) => {
  const n = 3;
  const lock = new NLock({
    n,
    sharedArray: new Int32Array(
      new SharedArrayBuffer(NLock.getExpectedBytesize(n))
    ),
    type: "my-lock",
    softTimeout: 10,
    timeout: 100,
    finally: prov.finally,
    wait: makeWaitCircuitBreaker(),
    DateNow: () => 1,
  });

  //allocate to make tests easier

  lock.allocate();
  lock.allocate();

  return lock;
};

/**
 *
 */
export const getUint32RedBlackTree = (
  prov: TestProvision,
  extra?: Partial<Uint32TreeMap>
) =>
  new Uint32TreeMap({
    makeHeap: makeMakeHeap(prov),
    verifyAfterOperations: true,
    ...extra,
  });

/**
 *
 */
export const getSharedDoublyLinkedList = (
  prov: TestProvision,
  extra: Partial<SharedDoublyLinkedListDeps> = {}
) => {
  const pageSize = 32;
  const nodeDataSize = 8;

  const list = new SharedDoublyLinkedList({
    heap: getInMemoryPagedHeap(prov, pageSize),
    nodeDataSize,
    dataSize: SharedDoublyLinkedList.getDataAvailable(pageSize, nodeDataSize),
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
  lock: Lock<any>,
  onMessage?: () => void
) =>
  makeLiveJacs_lazy(prov, filename, lock.pack(), {
    onMessage,
  });

/**
 *
 */
export const makeLockTestMain =
  (
    testMain: (lock: Lock<any>) => void
  ): BeeMain<ReturnType<Lock<any>["pack"]>> =>
  ({ beeData: lockData }) => {
    if (!lockData) {
      throw new Error("missing data.");
    }

    const lock = new Lock({
      ...lockData,
      finally: () => {},
      DateNow: () => 1,
      // softTimeout: undefined,
      // timeout: 4000, //
    });

    testMain(lock);
  };

/**
 *
 */
export const makeHeapTestMain =
  (
    testMain: (heap: SharedPageHeap, data: any) => void
  ): BeeMain<{ heap: ReturnType<SharedPageHeap["pack"]> }> =>
  ({ beeData: data }) => {
    if (!data) {
      throw new Error("missing data.");
    }

    const heap = new SharedPageHeap({
      ...data.heap,
    });

    testMain(heap, data);
  };
