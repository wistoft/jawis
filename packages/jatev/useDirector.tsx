import React, { useRef, useState } from "react";

import {
  useMemoDep,
  useKeyListener,
  HookSetState,
  makeSetPartialState,
} from "^jab-react";
import { OpenFile, def } from "^jab";
import { WebSocketProv } from "^react-use-ws";

import {
  ClientMessage,
  ServerMessage,
  ClientTestReport,
  RogueData,
  ClientTestInfo,
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
  State,
  ViewHome,
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
    | "clearAllRogueData"
    | "showTestCase"
    | "onCloseTestCase"
    | "onPrev"
    | "onNext"
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
    setTestSelection,
    clearAllRogueData,
    showTestCase,
    onCloseTestCase,
    onPrev,
    onNext,
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
      apiSend,
      onCloseTestCase,
      onPrev,
      onNext,
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
    clearAllRogueData,
    showTestCase,
    onCloseTestCase,
    onPrev,
    onNext,
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
        executingTest={state.executingTest}
        showTestCase={showTestCase}
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
      elm: <ViewHome {...viewProps} />,
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

  return { ...viewProps, setTestSelection, postNav, routes };
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
  //quick fix - use: makeSetStateCallback

  const setPartialState = makeSetPartialState(setState);

  const setIsRunning = (isRunning: boolean) => {
    setPartialState({ isRunning });
  };

  const setTestSelection = (data: ClientTestInfo[][]) => {
    //filter empty levels away.
    // A quick fix, needed to detect when there's no tests in `ViewExecutionList`
    const mapped = data.filter((level) => level.length > 0);

    setPartialState({ tests: testSelectionToCollection(mapped) });
  };

  //todo: getTest is implemented to slow, to run it for each test.
  const setExecutingTestCase = (testId?: string) => {
    if (testId) {
      setPartialState((old) => ({
        executingTest: {
          id: testId,
          name: def(old.tests).getTest(testId).name,
        },
      }));
    } else {
      setPartialState({ executingTest: undefined });
    }
  };

  const setTestReport = (result: ClientTestReport) => {
    setPartialState(makeTestCaseUpdater(result, getRandomToken));
  };

  const setRogue = (rogue: RogueData) => {
    setPartialState(makeRogueUpdater(rogue, getRandomToken));
  };

  const clearAllRogueData = () => {
    setPartialState({
      unknownRogue: undefined,
    });
  };

  //
  // user events
  //

  const showTestCase = (testId: string) => {
    setPartialState(makeShowTestUpdater(testId, getRandomToken));
  };

  const onCloseTestCase = () => {
    setPartialState({
      currentTest: undefined,
      currentTestFressness: undefined,
    });
  };

  const onPrev = () => {
    setPartialState(onPrevUpdater(getRandomToken));
  };

  const onNext = () => {
    setPartialState(onNextUpdater(getRandomToken));
  };

  const onServerMessage = makeOnServerMessage({
    setIsRunning,
    setTestSelection,
    setExecutingTestCase,
    setTestReport,
    setRogue,
  });

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
        type: "openFile",
        file: stateRef.current.currentTest.file,
        line: stateRef.current.currentTest.line,
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
    setTestSelection,
    clearAllRogueData,
    showTestCase,
    onCloseTestCase,
    onPrev,
    onNext,
    onServerMessage,
    openFile,
    onRunCurrentTest,
    onEditCurrentTest,
    runFailedTests,
    acceptAllLogs,
  };
};
