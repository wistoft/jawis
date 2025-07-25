import React from "react";

import { TestProvision } from "^jarun";
import { getConf, makeToAtomizedString, makeReplaceAtoms } from "^jab-react";
import { renderHook } from "^render-hook-plus";
import { CapturedValue, capture } from "^jab";
import { asyncCapture } from "^async-capture";
import { UseWsEffectArgs } from "^react-use-ws";

import {
  ViewTest,
  makeRogueUpdater,
  makeTestCaseUpdater,
  getShowTestOnTestChangeUpdate,
  ViewExecutionLevel,
  ViewExecutionLevelProps,
  ViewTestLog,
  ViewTestLogProps,
  TestState,
  useDirector,
  ViewTestLogContent,
  ViewTestLogContentProps,
  ClientTestReport,
  getClientTestReport,
  RogueData,
  ServerMessage,
} from "^jatev/internal";

import {
  defaultJatevState,
  makeGetIntegerSequence,
  getStateWithShownTest,
  getStateWithTestReports,
  getStateWithTests,
  makeTestInfo,
  getPrettyHtml,
} from ".";

export const getDefaultConf = () => getConf(0xf000); //another char, than used by jatev, so we don't interfere.

export const getToAtomizedString_test = () =>
  makeToAtomizedString(getDefaultConf().mapToAtoms);

export const getReplaceAtoms_test = () =>
  makeReplaceAtoms(getDefaultConf().atoms, getDefaultConf().mapToFinal);

/**
 *
 */
export const toHtml_test = (val: unknown) => clonedToHtml_test(capture(val));

/**
 *
 */
export const clonedToHtml_test = (val: CapturedValue) =>
  getPrettyHtml(<>{getReplaceAtoms_test()(getToAtomizedString_test()(val))}</>);

/**
 *
 */
export const toAtomizedString_test = (val: unknown) =>
  getToAtomizedString_test()(capture(val));

/**
 *
 */
export const toAtomizedString_async = async (val: unknown) =>
  getToAtomizedString_test()(await asyncCapture(val));

/**
 *
 */
export const getViewTest = (test: TestState) => (
  <ViewTest
    currentTest={test}
    projectRoot={"C:\\packages\\"}
    onCloseTestCase={() => {}}
    onPrev={() => {}}
    onNext={() => {}}
    onRunCurrentTest={() => {}}
    onEditCurrentTest={() => {}}
    apiSend={() => {}}
    openFile={() => {}}
  />
);

/**
 *
 */
export const getViewTestLog = (
  props: Partial<ViewTestLogProps> & Pick<ViewTestLogProps, "testLog">
) => (
  <ViewTestLog
    testId={"testId"}
    rogue={false}
    apiSend={() => {}}
    projectRoot={"C:\\packages\\"}
    openFile={() => {}}
    {...props}
  />
);

/**
 *
 */
export const getViewTestLogContent = (
  props: Partial<ViewTestLogContentProps> &
    Pick<ViewTestLogContentProps, "testLog">
) => (
  <ViewTestLogContent
    showTestLogType={"cmp"}
    projectRoot={"C:\\packages\\"}
    openFile={() => {}}
    {...props}
  />
);

/**
 *
 */
export const getViewExecutionLevel = (
  props: Partial<ViewExecutionLevelProps> &
    Pick<ViewExecutionLevelProps, "level">
) => <ViewExecutionLevel showTestCase={() => {}} {...props} />;

/**
 *
 */
export const renderUseJatevDirector = (prov: TestProvision) => {
  let useWsEffectArgs!: UseWsEffectArgs<ServerMessage>;

  //render

  const hookProv = renderHook(useDirector, {
    apiSend: (data) => {
      prov.log("apiSend", data);
    },
    wsState: "closed",
    useWsEffect: (data) => {
      //executed sync. Because jatev registers effect in render.
      useWsEffectArgs = data;
    },
    getRandomToken: makeGetIntegerSequence(),
    useKeyListener: () => {},
    projectRoot: "dummy",
  });

  return { ...hookProv, ...useWsEffectArgs };
};

/**
 *
 */
export const renderUseJatevDirector_with_tests = (prov: TestProvision) => {
  const stuff = renderUseJatevDirector(prov);

  stuff.onServerMessage({
    type: "TestSelection",
    data: [[makeTestInfo("test 1"), makeTestInfo("test 2")]],
  });

  return { ...stuff, result: stuff.rerender() };
};

/**
 *
 */
export const renderUseJatevDirector_with_test_results = (
  prov: TestProvision
) => {
  const stuff = renderUseJatevDirector_with_tests(prov);

  stuff.onServerMessage({
    type: "TestReport",
    data: getClientTestReport(
      "test 1",
      { user: { blabla: ["What you expect"] } },
      { user: { blabla: ["What you expect"] } }
    ),
  });

  return { ...stuff, result: stuff.rerender() };
};

/**
 *
 */
export const getSetTestCaseUpdate_empty = (test: ClientTestReport) =>
  makeTestCaseUpdater(test, makeGetIntegerSequence())(defaultJatevState);

/**
 *
 */
export const getSetTestCaseUpdate_with_tests = (test: ClientTestReport) =>
  makeTestCaseUpdater(test, makeGetIntegerSequence())(getStateWithTests());

/**
 *
 */
export const getShownTestUpdate_empty = (test: TestState) =>
  getShowTestOnTestChangeUpdate(
    test,
    defaultJatevState,
    makeGetIntegerSequence()
  );

/**
 *
 */
export const getShownTestUpdate_with_tests = (test: TestState) =>
  getShowTestOnTestChangeUpdate(
    test,
    getStateWithTests(),
    makeGetIntegerSequence()
  );

/**
 *
 */
export const getShownTestUpdate_with_shown_test = (test: TestState) =>
  getShowTestOnTestChangeUpdate(
    test,
    getStateWithShownTest(),
    makeGetIntegerSequence()
  );

/**
 *
 */
export const getRogueUpdate_empty = (rogue: RogueData) =>
  makeRogueUpdater(rogue, makeGetIntegerSequence())(defaultJatevState);

/**
 *
 */
export const getRogueUpdate_with_tests = (rogue: RogueData) =>
  makeRogueUpdater(rogue, makeGetIntegerSequence())(getStateWithTests());

/**
 *
 */
export const getRogueUpdate_with_test_reports = (rogue: RogueData) =>
  makeRogueUpdater(rogue, makeGetIntegerSequence())(getStateWithTestReports());
