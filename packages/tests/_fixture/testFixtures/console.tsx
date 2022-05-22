import { EventController, sleeping } from "^jab";
import React from "react";

import {
  CaptureCache,
  ConsoleEntry,
  createCallbacks,
  Props as ConsoleProps,
  State,
} from "^console";
import { TestProvision } from "^jarun";

import { View } from "^console/View";
import { ViewEntry, Props as ViewEntryProps } from "^console/ViewEntry";
import { ViewLogEntry } from "^console/ViewLogEntry";
import { makeConsoleChangeCallback } from "^console/makeUseConsoleStream";

import { defaultConsoleState, makeGetIntegerSequence, getUiEntries } from ".";
import { makeStdioFilter } from "^util-javi/node";

export const jcvProps = (): ConsoleProps => ({
  logs: getUiEntries(),
  projectRoot: "C:\\",
  clearAllLogs: () => {},
  openFile: () => {},
  useToggleEntry: () => () => {},
  useRemoveEntry: () => () => {},
});

export const getView = () => (
  <View
    logs={getUiEntries()}
    projectRoot={"C:\\"}
    clearAllLogs={() => {}}
    openFile={() => {}}
    useToggleEntry={() => () => {}}
    useRemoveEntry={() => () => {}}
  />
);

export const getViewEntry = (props: Partial<ViewEntryProps>) => (
  <ViewEntry
    entry={{
      id: 1,
      type: "log",
      context: "browser",
      logName: "log",
      data: [],
    }}
    projectRoot={"C:\\"}
    openFile={() => {}}
    useToggleEntry={() => () => {}}
    useRemoveEntry={() => () => {}}
    {...props}
  />
);

export const getViewLogEntry = () => (
  <ViewLogEntry
    entry={{
      type: "log",
      logName: "log",
      data: [],
    }}
    wrapperStyle={{}}
    onToggleEntry={() => {}}
  />
);

/**
 * facade/setup for testing.
 */
export const getConsoleFire = (onData?: (entries: ConsoleEntry[]) => void) => {
  const captureCache: CaptureCache = {
    data: [],
    onChange: () => {},
  };

  const eventStream = new EventController<ConsoleEntry[]>();

  const onChange = makeConsoleChangeCallback(eventStream, captureCache, 10, 0);

  if (onData) {
    eventStream.addListener(onData);
  }

  //to simulate the captured emitters.
  const fire = (data: ConsoleEntry) => {
    captureCache.data.push(data);
    onChange();
  };

  return { fire, captureCache };
};

/**
 *
 */
export const addDataUpdate_empty = (
  prov: TestProvision,
  entries: ConsoleEntry[],
  doSourceMap = false
) => {
  //for collecting state updates

  let currentState = defaultConsoleState;
  const states: State[] = [];

  const setState = (updater: State | ((old: State) => State)) => {
    if (typeof updater === "function") {
      currentState = updater(currentState);
    } else {
      currentState = updater;
    }

    states.push(currentState);
  };

  // setup

  const callbacks = createCallbacks({
    setState,
    makeReactKey: makeGetIntegerSequence(),
  });

  // do it

  return callbacks.addData(entries, doSourceMap).then(() => states);
};

const includeLine = (line: string) => {
  return !["a", "b"].includes(line);
};

/**
 * Without flush on partial lines
 */
export const filterStdioTest = (input: string | string[]) => {
  let done = false;
  const arr = typeof input === "string" ? [input] : input;

  let result = "";

  const filter = makeStdioFilter((out) => {
    if (done) {
      throw new Error("Output after filter is finished.");
    }
    if (out !== undefined) {
      result += out;
    }
  }, includeLine);

  arr.forEach((str) => {
    filter(str);
  });

  done = true;

  return result;
};

/**
 * Flushing partial lines after 0ms.
 */
export const filterStdioWithFlushTest = async (input: string | string[]) => {
  const arr = typeof input === "string" ? [input] : input;

  let result = "";

  const filter = makeStdioFilter(
    (out) => {
      if (out !== undefined) {
        result += out;
      }
    },
    includeLine,
    0
  );

  for (const str of arr) {
    filter(str);
    await sleeping(100);
  }

  return result;
};
