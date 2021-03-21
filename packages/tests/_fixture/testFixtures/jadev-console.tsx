import React from "react";

import { EventController } from "^jab";
import {
  CaptureCache,
  ConsoleEntry,
  createCallbacks,
  Props as ConsoleProps,
  State,
} from "^jadev-console";
import { TestProvision } from "^jarun";

import { View } from "^jadev-console/View";
import { ViewEntry, Props as ViewEntryProps } from "^jadev-console/ViewEntry";
import { ViewLogEntry } from "^jadev-console/ViewLogEntry";
import { makeConsoleChangeCallback } from "^jadev-console/makeUseConsoleStream";

import { defaultJatevState, makeGetRandomInteger, uiEntries } from ".";

export const jcvProps: ConsoleProps = {
  logs: uiEntries,
  projectRoot: "C:\\",
  clearAllLogs: () => {},
  openFile: () => {},
  useToggleEntry: () => () => {},
  useRemoveEntry: () => () => {},
};

export const getView = () => (
  <View
    logs={uiEntries}
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

  let currentState = defaultJatevState;
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
    makeReactKey: makeGetRandomInteger(),
  });

  // do it

  return callbacks.addData(entries, doSourceMap).then(() => states);
};
