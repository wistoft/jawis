import { sleeping } from "^yapu";

import { TestProvision } from "^jarun";
import {
  getSharedDynamicMap,
  getSharedTreeHeap,
  makeSharedDynamicMap,
  makeSharedTreeHeapMain,
  runLiveJacsBee_lazy,
} from "^tests/_fixture";
import {
  AbsoluteFile,
  assert,
  base64ToBinary,
  getRandomUint8Array_old,
  toBytes,
  toJsCode,
} from "^jab";
import { SharedDynamicMap } from "^shared-dynamic-map/internal";
import { equal } from "^shared-algs";

export default async (prov: TestProvision) => {
  const test = new TestCase(prov);

  for (let i = 1; i < 50; i++) {
    test.testCase();
  }
};

type ControlData = {
  key: Uint8Array;
  value: Uint8Array;
};

class TestCase {
  public trace: string[] = [];
  public map!: SharedDynamicMap;
  public controlMap!: Map<string, ControlData>;

  constructor(private prov: TestProvision) {}

  /**
   *
   */
  init() {
    this.trace = [];
    this.map = getSharedDynamicMap(this.prov);
    this.controlMap = new Map();
  }

  /**
   *
   */
  testCase() {
    const REPEAT2 = 5;

    try {
      this.init();

      // set

      for (let j = 0; j < REPEAT2; j++) {
        this.add();
      }

      // check and delete

      for (const [_key, expected] of this.controlMap) {
        this.remove(_key, expected);
      }

      this.controlMap = new Map();

      //dispose

      this.map.dispose();
    } catch (error) {
      console.log(this.trace.join("\n"));
      throw error;
    }
  }

  /**
   *
   */
  add() {
    const key = getRandomUint8Array_old(10);
    const value = getRandomUint8Array_old(10);

    const _key = toJsCode(key);
    const _value = toJsCode(value);

    this.trace.push(`map.set(${_key}, ${_value});`);

    this.map.set(key, value);

    this.controlMap.set(_key, { key, value });
  }

  /**
   *
   */
  remove(_key: string, expected: ControlData) {
    const actual = this.map.get(expected.key)!;

    assert(equal(expected.value, actual), "Map returned wrong value: ", {
      actual,
      expected,
    });

    //delete

    this.trace.push("map.delete(" + _key + ");");

    this.map.delete(expected.key);
  }
}
