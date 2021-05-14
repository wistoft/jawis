import { TextDecoder, TextEncoder } from "util";

import { assert, assertNever, err } from "^jab";

import { ConsumerMessage, getDebugSummary } from ".";

export const ControlArrayLength = 5; //must match CaIndex

export enum ConsumerStates {
  "ready",
  "requesting",
  "timed_out",
}

export enum ConsumerShould {
  "sleep",
  "work",
}

export enum ProducerStates {
  "ready",
  "compiling",
  "notifying",
  "timed_out",
  "error",
}

export enum CaIndex { // control array index
  "sleep_bit",
  "result_type",
  "data_length",
  "consumer_state",
  "producer_state",
}

export enum ResultType {
  "none",
  "success",
  "error",
}

export type WaitFunc = (
  typedArray: Int32Array,
  index: number,
  value: number,
  timeout?: number
) => "ok" | "not-equal" | "timed-out";

const NoDataLength = -1;

/**
 * - producer creates the array, so it we can assert it's ready.
 * - consumer state is unknown to the producer, but it's not important, so it's just set ready.
 */
export const getControlArray = () => {
  const controlArray = new Int32Array(
    new SharedArrayBuffer(ControlArrayLength * 4)
  );

  Atomics.store(controlArray, CaIndex.consumer_state, ConsumerStates.ready); // prettier-ignore

  Atomics.store(controlArray, CaIndex.producer_state, ProducerStates.ready); // prettier-ignore

  return controlArray;
};

/**
 * Ask for getting a file compiled (synchronously by sleeping)
 *
 * - softTimeout is optional.
 */
export const requestProducerSync = (
  file: string,
  controlArray: Int32Array,
  dataArray: Uint8Array,
  timeout: number,
  softTimeout: number | undefined,
  postMessage: (msg: ConsumerMessage) => void,
  wait: WaitFunc = Atomics.wait,
  DateNow: () => number
): string => {
  assert(controlArray.length === ControlArrayLength, "controlArray has wrong length:", controlArray.length ); // prettier-ignore

  //check producer state
  // Producers state isn't exact here. We could execute between producer notifies and sets its state bit.

  const preProducerState = ProducerStates[controlArray[CaIndex.producer_state]]; // prettier-ignore

  assert(preProducerState === "ready" || preProducerState === "notifying", "Expected producer to be ready, was: " + preProducerState); // prettier-ignore

  //own state

  const ownState = ConsumerStates[controlArray[CaIndex.consumer_state]]; // prettier-ignore

  assert(ownState === "ready", "Expected own state to be ready, was: " + ownState); // prettier-ignore

  Atomics.store(controlArray, CaIndex.consumer_state, ConsumerStates.requesting); // prettier-ignore

  //to be able to see, whether producer stores result.

  Atomics.store(controlArray, CaIndex.result_type, ResultType.none); // prettier-ignore
  Atomics.store(controlArray, CaIndex.data_length, NoDataLength);

  //wait sync for results

  Atomics.store(controlArray, CaIndex.sleep_bit, ConsumerShould.sleep); //ensure goto sleep.

  //start the work
  // this can actually finish "synchronously". I.e. the producer receives this event process it,
  // and tries to notify, before this consumer can make one step.

  postMessage({ type: "jacs-compile", file });

  // sleep if needed

  let val: "ok" | "timed-out" | "not-equal";
  const startTime = DateNow();
  let actualTimeout: number | undefined = softTimeout || timeout;
  let hasBeenSoftTimeout = false;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    val = wait(controlArray, CaIndex.sleep_bit, ConsumerShould.sleep, actualTimeout); // prettier-ignore

    //give warning on first timeout

    if (val === "timed-out" && softTimeout && !hasBeenSoftTimeout) {
      //give warning

      console.log("Soft timeout in consumer.", getDebugSummary(file, controlArray, timeout, softTimeout) ); // prettier-ignore

      //setup to wait for next timeout

      actualTimeout = timeout - softTimeout;
      hasBeenSoftTimeout = true;
      continue;
    }

    //protect against spurious wake

    if (
      val === "ok" &&
      controlArray[CaIndex.sleep_bit] === ConsumerShould.sleep
    ) {
      continue;
    }

    break;
  }

  //process result

  const resultType = controlArray[CaIndex.result_type] as ResultType; // prettier-ignore
  const dataLength = controlArray[CaIndex.data_length];

  switch (val) {
    // not-equal can happen if producer has finished, before we have a chance to sleep.
    case "not-equal":
    case "ok": {
      //tell if producer responsed between first and second timeout

      if (hasBeenSoftTimeout) {
        console.log(
          "Producer responded late, time: " + (DateNow() - startTime)
        );
      }

      // check the part of result.

      if (dataLength === NoDataLength) {
        err("producer didn't set data length.", getDebugSummary(file, controlArray, timeout, softTimeout)); // prettier-ignore
      }

      //handle result

      const buffer = dataArray.slice(0, dataLength);

      const msg = new TextDecoder().decode(buffer);

      switch (resultType) {
        case ResultType.none:
          throw err("Jacs producer didn't set result type.");

        case ResultType.success:
          Atomics.store(controlArray, CaIndex.consumer_state, ConsumerStates.ready); // prettier-ignore
          return msg;

        case ResultType.error:
          throw err("Jacs producer error: " + msg);

        default:
          return assertNever(resultType, "Unknown result type.");
      }
    }

    case "timed-out":
      Atomics.store(controlArray, CaIndex.consumer_state, ConsumerStates.timed_out); // prettier-ignore

      throw err("Timeout in consumer.", getDebugSummary(file, controlArray, timeout, softTimeout)); // prettier-ignore

    default:
      return assertNever(val, "Unknown value from Atomics.wait()");
  }
};

/**
 * - Mostly to be defensive about states, to give some debugging information, when things fail.
 */
export const setCompiling = (controlArray: Int32Array) => {
  assert( controlArray.length === ControlArrayLength, "controlArray has wrong length:", controlArray.length ); // prettier-ignore

  //check consumer state

  const consumerState = ConsumerStates[controlArray[CaIndex.consumer_state]]; // prettier-ignore

  assert(consumerState === "requesting", "expected consumer to be requesting, was: " + consumerState ); // prettier-ignore

  //own state

  const ownState = ProducerStates[controlArray[CaIndex.producer_state] as ProducerStates]; // prettier-ignore

  assert(ownState === "ready", "expected own state to be ready, was: " + ownState ); // prettier-ignore

  //set state

  Atomics.store(controlArray, CaIndex.producer_state, ProducerStates.compiling); // prettier-ignore
};

/**
 *
 * - Copy data into shared memory.
 * - Store data length and type in shared memory.
 * - notify the consumer.
 */
export const signalConsumerSync = (
  type: "success" | "error",
  data: string,
  controlArray: Int32Array,
  dataArray: Uint8Array,
  notify: typeof Atomics.notify = Atomics.notify
) => {
  //
  assert( controlArray.length === ControlArrayLength, "controlArray has wrong length:", controlArray.length ); // prettier-ignore

  //check consumer state

  const consumerState = ConsumerStates[controlArray[CaIndex.consumer_state]]; // prettier-ignore

  assert(consumerState === "requesting", "expected consumer state to be requesting, was: " + consumerState ); // prettier-ignore

  //own state

  const ownState = ProducerStates[controlArray[CaIndex.producer_state] as ProducerStates]; // prettier-ignore

  assert(ownState === "compiling", "expected own state to be compiling, was: " + ownState ); // prettier-ignore

  //store source code

  const encodeResult = new TextEncoder().encodeInto(data, dataArray);

  //check that there was space enough (i.e. all data read)

  assert(encodeResult.read === data.length, "Encoded source file too large: ", data.length,  dataArray.length ); // prettier-ignore

  //store result

  Atomics.store(controlArray, CaIndex.result_type, ResultType[type]);
  Atomics.store(controlArray, CaIndex.data_length, encodeResult.written);

  //set state

  Atomics.store(controlArray, CaIndex.producer_state, ProducerStates.notifying); // prettier-ignore

  //wake consumer

  Atomics.store(controlArray, CaIndex.sleep_bit, ConsumerShould.work); //ensure consumer know it should work.

  notify(controlArray, CaIndex.sleep_bit, Infinity);

  //set state

  if (type === "success") {
    Atomics.store(controlArray, CaIndex.producer_state, ProducerStates.ready); // prettier-ignore
  } else {
    Atomics.store(controlArray, CaIndex.producer_state, ProducerStates.error); // prettier-ignore
  }
};
