import React from "react";

import { EventController, assert } from "^jab";

import {
  CaptureCache,
  ConsoleEntry,
  ViewProps,
  ViewLogEntry,
  makeConsoleChangeCallback,
  View,
  ViewEntry,
  ViewEntryProps,
  makeAddDataUpdater,
} from "^console/internal";

import { defaultConsoleState, makeGetIntegerSequence, getUiEntries } from ".";

export const jcvProps = (): ViewProps => ({
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
 *
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
export const getAddDataUpdate_empty = (entries: ConsoleEntry[]) => {
  const doSourceMap = false;
  const { sync, asyncs } = makeAddDataUpdater(
    entries,
    makeGetIntegerSequence(),
    doSourceMap
  );

  assert(asyncs.length === 0, "Can't test async this way.");

  return sync(defaultConsoleState);
};
