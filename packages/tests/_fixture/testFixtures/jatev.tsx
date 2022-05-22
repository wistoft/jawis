import React from "react";

import {
  ClientTestReport,
  getClientTestReport,
  RogueData,
  ServerMessage,
} from "^jatec";
import { TestProvision } from "^jarun";
import {
  UseWsEffectArgs,
  getConf,
  makeToAtomizedString,
  makeReplaceAtoms,
} from "^jab-react";
import { getHtmlRTR, wrapHook } from "^misc/node";
import { asyncClone, clone } from "^jab";

import { ViewTest } from "^jatev/ViewTest";
import {
  makeRogueUpdater,
  makeTestCaseUpdater,
  getShowTestOnTestChangeUpdate,
} from "^jatev/updaters";
import {
  ViewExecutionLevel,
  Props as ViewExecutionLevelProps,
} from "^jatev/ViewExecutionLevel";
import { ViewTestLog, Props as ViewTestLogProps } from "^jatev/ViewTestLog";
import { TestState } from "^jatev/types";
import { useDirector } from "^jatev/useDirector";

import {
  defaultState,
  makeGetIntegerSequence,
  getStateWithShownTest,
  getStateWithTestReports,
  getStateWithTests,
  makeTestInfo,
} from ".";
import {
  ViewTestLogContent,
  Props as ViewTestLogContentProps,
} from "^jatev/ViewTestLogContent";

export const getDefaultConf = () => getConf(0xf000); //another char, than used by jatev, so we don't interfere.

export const getToAtomizedString_test = () =>
  makeToAtomizedString(getDefaultConf().mapToAtoms);

export const getReplaceAtoms_test = () =>
  makeReplaceAtoms(getDefaultConf().atoms, getDefaultConf().mapToFinal);

/**
 *
 */
export const toHtml_test = (val: unknown) =>
  getHtmlRTR(
    <>{getReplaceAtoms_test()(getToAtomizedString_test()(clone(val)))}</>
  );

/**
 *
 */
export const tos_test = (val: unknown) =>
  getToAtomizedString_test()(clone(val));

/**
 *
 */
export const tos_async = async (val: unknown) =>
  getToAtomizedString_test()(await asyncClone(val));

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

  const hookProv = wrapHook(useDirector, {
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
  makeTestCaseUpdater(test, makeGetIntegerSequence())(defaultState);

/**
 *
 */
export const getSetTestCaseUpdate_with_tests = (test: ClientTestReport) =>
  makeTestCaseUpdater(test, makeGetIntegerSequence())(getStateWithTests());

/**
 *
 */
export const getShownTestUpdate_empty = (test: TestState) =>
  getShowTestOnTestChangeUpdate(test, defaultState, makeGetIntegerSequence());

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
export const getRogueUpdater_empty = (rogue: RogueData) =>
  makeRogueUpdater(rogue, makeGetIntegerSequence())(defaultState);

/**
 *
 */
export const getRogueUpdater_with_tests = (rogue: RogueData) =>
  makeRogueUpdater(rogue, makeGetIntegerSequence())(getStateWithTests());

/**
 *
 */
export const getRogueUpdater_with_test_reports = (rogue: RogueData) =>
  makeRogueUpdater(rogue, makeGetIntegerSequence())(getStateWithTestReports());
