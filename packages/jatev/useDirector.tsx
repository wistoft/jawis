import React, { useRef, useState } from "react";

import {
  ClientMessage,
  ServerMessage,
  ClientTestReport,
  RogueData,
  TestInfo,
} from "^jatec";

import {
  useMemoDep,
  makeUseFunction,
  WebSocketProv,
  useKeyListener,
  HookSetState,
  makeSetPartialState,
} from "^jab-react";

import { OpenFile } from "^util-javi";

import { makeOnServerMessage } from "./onServerMessage";
import { ViewAction, Props as ViewActionProps } from "./ViewAction";
import { ViewControls } from "./ViewControls";
import { makeOnKeydown } from "./onKeydown";
import { testSelectionToCollection } from "./TestCollection";
import { StateCallbacks, State } from "./types";
import {
  makeTestCaseUpdater,
  makeShowTestUpdater,
  onNextUpdater,
  onPrevUpdater,
  makeRogueUpdater,
} from "./updaters";
import { getTestLogsThatDiffer } from "./util";
import { def } from "^jab";
import { ViewHome } from "./ViewHome";

export type Props = {
  getRandomToken: () => number;
  useKeyListener: typeof useKeyListener;
  showDtpLink?: boolean; //default false
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
  showDtpLink,
  ...extra
}: Props) => {
  const [state, setState] = useState<State>({
    isRunning: false,
    userMessage: "",
  });

  const stateRef = useRef(state);
  stateRef.current = state;

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

  //web socket

  useWsEffect({ onServerMessage });

  //key events

  useKeyListener(
    makeOnKeydown({
      ...callbacks,
      apiSend,
      onRunCurrentTest,
      onEditCurrentTest,
    })
  );

  //shared props between routes.

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

  //post nav

  const postNav = (
    <>
      <ViewControls
        apiSend={apiSend}
        isRunning={state.isRunning}
        executingTest={state.executingTest}
        showTestCase={callbacks.showTestCase}
        runFailedTests={runFailedTests}
        acceptAllLogs={acceptAllLogs}
      />
      {wsState === "reconnecting" && " " + wsState}
    </>
  );

  //routes

  const routes = [
    {
      name: "Home",
      elm: <ViewHome {...viewProps} />,
    },
    {
      name: "cur",
      elm: ( <ViewAction action={{ action: "runCurrentSelection" }} {...viewProps} /> ), // prettier-ignore
    },

    {
      name: "all",
      elm: ( <ViewAction action={{ action: "runAllTests" }} {...viewProps} /> ), // prettier-ignore
    },
  ];

  if (showDtpLink) {
    routes.push({
      name: "dtp",
      elm: ( <ViewAction action={{ action: "runDtp" }} {...viewProps} /> ), // prettier-ignore
    });
  }

  // prov

  return { ...viewProps, postNav, routes };
};

//
// util
//

type StructureDeps = {
  stateRef: { current: State };
  setState: HookSetState<State>;
  apiSend: (data: ClientMessage) => void;
  getRandomToken: () => number;
};

/**
 *
 */
const createStructure = ({
  stateRef,
  apiSend,
  setState,
  getRandomToken,
}: StructureDeps) => {
  const callbacks = getCallbacks(setState, getRandomToken);

  const onServerMessage = makeOnServerMessage(callbacks);

  const useApiSend = makeUseFunction(apiSend);

  const openFile: OpenFile = (deps: { file: string; line?: number }) => {
    apiSend({
      action: "openFile",
      ...deps,
    });
  };

  // can't be memoized with object structure, because they depend on state.

  const onRunCurrentTest = () => {
    if (stateRef.current.currentTest) {
      apiSend({
        action: "prependTests",
        ids: [stateRef.current.currentTest.id],
      });
    }
  };

  const onEditCurrentTest = () => {
    if (stateRef.current.currentTest) {
      apiSend({
        action: "openTest",
        id: stateRef.current.currentTest.id,
      });
    }
  };

  const runFailedTests = () => {
    if (stateRef.current.tests) {
      apiSend({
        action: "prependTests",
        ids: getTestLogsThatDiffer(stateRef.current.tests.tests, true),
      });
    }
  };

  const acceptAllLogs = () => {
    if (stateRef.current.tests) {
      apiSend({
        action: "acceptTestLogs",
        testIds: getTestLogsThatDiffer(stateRef.current.tests.tests, false),
      });
    }
  };

  return {
    callbacks,
    onServerMessage,
    useApiSend,
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

    setTestSelection: (data: TestInfo[][]) => {
      //filter empty levels away.
      // A quick fix, needed to detect when there's no tests in `ViewExecutionList`
      const mapped = data.filter((level) => level.length > 0);

      setPartialState({ tests: testSelectionToCollection(mapped) });
    },

    //I think getTest is implemented to slow, to run it for each test.
    setExecutingTestCase: (testId?: string) => {
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
