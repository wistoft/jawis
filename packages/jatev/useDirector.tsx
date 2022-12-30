import React, { useRef, useState } from "react";

import {
  ClientMessage,
  ServerMessage,
  ClientTestReport,
  RogueData,
} from "^jatec";

import {
  useMemoDep,
  makeUseFunction,
  useKeyListener,
  HookSetState,
  makeSetPartialState,
} from "^jab-react";

import { OpenFile } from "^jab";

import { WebSocketProv } from "^use-websocket";
import {
  makeOnServerMessage,
  ViewAction,
  ViewActionProps,
  ViewControls,
  makeOnKeydown,
  testSelectionToCollection,
  makeTestCaseUpdater,
  makeShowTestUpdater,
  onNextUpdater,
  onPrevUpdater,
  makeRogueUpdater,
  getTestLogsThatDiffer,
  StateCallbacks,
  State,
} from "./internal";

export type DirectorProps = {
  getRandomToken: () => number;
  useKeyListener: typeof useKeyListener;
} & WebSocketProv<ClientMessage, ServerMessage> &
  Omit<
    ViewActionProps,
    | "action"
    | "callbacks"
    | "state"
    | "onRunCurrentTest"
    | "onEditCurrentTest"
    | "openFile"
  >;

/**
 *
 */
export const useDirector = ({
  apiSend,
  wsState,
  useWsEffect,
  getRandomToken,
  useKeyListener,
  ...extra
}: DirectorProps) => {
  // state

  const [state, setState] = useState<State>({
    isRunning: false,
    userMessage: "",
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  // structure

  const {
    callbacks,
    onServerMessage,
    openFile,
    onRunCurrentTest,
    onEditCurrentTest,
    runFailedTests,
    acceptAllLogs,
  } = useMemoDep(
    { stateRef, setState, apiSend, getRandomToken },
    createStructure
  );

  // web socket

  useWsEffect({ onServerMessage });

  // key events

  useKeyListener(
    makeOnKeydown({
      ...callbacks,
      apiSend,
      onRunCurrentTest,
      onEditCurrentTest,
    })
  );

  // shared props between routes.

  const viewProps: Omit<ViewActionProps, "action"> = {
    ...extra,
    apiSend,
    wsState,
    state,
    callbacks,
    openFile,
    onRunCurrentTest,
    onEditCurrentTest,
  };

  // post nav

  const postNav = (
    <>
      <ViewControls
        apiSend={apiSend}
        isRunning={state.isRunning}
        executingTestId={state.executingTestId}
        showTestCase={callbacks.showTestCase}
        runFailedTests={runFailedTests}
        acceptAllLogs={acceptAllLogs}
      />
      {wsState === "reconnecting" && " " + wsState}
    </>
  );

  // routes

  const routes = [
    {
      name: "Home",
      elm: (
        <>
          {" "}
          <br />
          To run tests: click <i>cur</i> or <i>all</i>, and reload page.
        </>
      ),
    },
    {
      name: "cur",
      elm: ( <ViewAction action={{ type: "runCurrentSelection" }} {...viewProps} /> ), // prettier-ignore
    },

    {
      name: "all",
      elm: ( <ViewAction action={{ type: "runAllTests" }} {...viewProps} /> ), // prettier-ignore
    },
  ];

  // done

  return { ...viewProps, postNav, routes };
};

//
// util
//

type StructureDeps = {
  apiSend: (data: ClientMessage) => void;
  setState: HookSetState<State>;
  stateRef: { current: State };
  getRandomToken: () => number;
};

/**
 *
 */
const createStructure = ({
  apiSend,
  setState,
  stateRef,
  getRandomToken,
}: StructureDeps) => {
  const callbacks = getCallbacks(setState, getRandomToken);

  const onServerMessage = makeOnServerMessage(callbacks);

  const useApiSend = makeUseFunction(apiSend);

  const openFile: OpenFile = (deps: { file: string; line?: number }) => {
    apiSend({
      type: "openFile",
      ...deps,
    });
  };

  // can't be memoized with object structure, because they depend on state.

  const onRunCurrentTest = () => {
    if (stateRef.current.currentTest) {
      apiSend({
        type: "prependTests",
        ids: [stateRef.current.currentTest.id],
      });
    }
  };

  const onEditCurrentTest = () => {
    if (stateRef.current.currentTest) {
      apiSend({
        type: "openTest",
        file: stateRef.current.currentTest.id,
      });
    }
  };

  const runFailedTests = () => {
    if (stateRef.current.tests) {
      apiSend({
        type: "prependTests",
        ids: getTestLogsThatDiffer(stateRef.current.tests.tests, true),
      });
    }
  };

  const acceptAllLogs = () => {
    if (stateRef.current.tests) {
      apiSend({
        type: "acceptTestLogs",
        testIds: getTestLogsThatDiffer(stateRef.current.tests.tests, false),
      });
    }
  };

  return {
    useApiSend,
    onServerMessage,
    callbacks,
    openFile,
    onRunCurrentTest,
    onEditCurrentTest,
    runFailedTests,
    acceptAllLogs,
  };
};

/**
 *
 */
export const getCallbacks = (
  setState: HookSetState<State>,
  getRandomToken: () => number
): StateCallbacks => {
  //quick fix - use: makeSetStateCallback

  const setPartialState = makeSetPartialState(setState);

  return {
    setIsRunning: (isRunning: boolean) => {
      setPartialState({ isRunning });
    },

    setTestSelection: (data: string[][]) => {
      //maybe server could map do these things.
      //filter empty levels away.
      // A quick fix, needed to detect when there's no test in `ViewExecutionList`
      const mapped = data
        .map((level) => level.map((id) => ({ id })))
        .filter((level) => level.length > 0);

      setPartialState({ tests: testSelectionToCollection(mapped) });
    },

    setExecutingTestCase: (testId?: string) => {
      setPartialState({ executingTestId: testId });
    },

    setTestReport: (result: ClientTestReport) => {
      setPartialState(makeTestCaseUpdater(result, getRandomToken));
    },

    setRogue: (rogue: RogueData) => {
      setPartialState(makeRogueUpdater(rogue, getRandomToken));
    },

    //
    // user events
    //

    showTestCase: (testId: string) => {
      setPartialState(makeShowTestUpdater(testId, getRandomToken));
    },

    onCloseTestCase: () => {
      setPartialState({
        currentTest: undefined,
        currentTestFressness: undefined,
      });
    },

    onPrev: () => {
      setPartialState(onPrevUpdater(getRandomToken));
    },

    onNext: () => {
      setPartialState(onNextUpdater(getRandomToken));
    },
  };
};
