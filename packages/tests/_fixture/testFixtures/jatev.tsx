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
import { getHtmlRTR } from "^misc/node";
import { renderHook } from "^render-hook-plus";
import { clone } from "^jab";

import { ViewTest } from "^jatev/ViewTest";
import {
  makeRogueUpdater,
  makeTestCaseUpdater,
  getShowTestOnTestChangeUpdate,
} from "^jatev/updaters";
import {
  ViewExecutionLevel,
  ViewExecutionLevelProps,
} from "^jatev/ViewExecutionLevel";
import { ViewTestLog, ViewTestLogProps } from "^jatev/ViewTestLog";
import { TestState, TestStateUpdate } from "^jatev";
import { useDirector } from "^jatev/useDirector";

import {
  defaultState,
  makeGetRandomInteger,
  stateWithShownTest,
  stateWithTestReports,
  stateWithTests,
} from ".";
import {
  ViewTestLogContent,
  ViewTestLogContentProps,
} from "^jatev/ViewTestLogContent";
import { asyncCapture } from "^async-capture";

export const defaultConf = getConf(0xf000); //another char, than used by jatev, so we don't interfere.

export const toAtomizedString_test = makeToAtomizedString(
  defaultConf.mapToAtoms
);

export const replaceAtoms_test = makeReplaceAtoms(
  defaultConf.atoms,
  defaultConf.mapToFinal
);

/**
 *
 */
export const toHtml_test = (val: unknown) =>
  getHtmlRTR(<>{replaceAtoms_test(toAtomizedString_test(clone(val)))}</>);

/**
 *
 */
export const tos_test = (val: unknown) => toAtomizedString_test(clone(val));

/**
 *
 */
export const tos_async = async (val: unknown) =>
  toAtomizedString_test(await asyncCapture(val));

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
    getRandomToken: makeGetRandomInteger(),
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
    data: [["test 1", "test 2"]],
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
  makeTestCaseUpdater(test, makeGetRandomInteger())(defaultState);

/**
 *
 */
export const getSetTestCaseUpdate_with_tests = (test: ClientTestReport) =>
  makeTestCaseUpdater(test, makeGetRandomInteger())(stateWithTests);

/**
 *
 */
export const getShownTestUpdate_empty = (test: TestStateUpdate) =>
  getShowTestOnTestChangeUpdate(test, defaultState, makeGetRandomInteger());

/**
 *
 */
export const getShownTestUpdate_with_tests = (test: TestStateUpdate) =>
  getShowTestOnTestChangeUpdate(test, stateWithTests, makeGetRandomInteger());

/**
 *
 */
export const getShownTestUpdate_with_shown_test = (test: TestStateUpdate) =>
  getShowTestOnTestChangeUpdate(
    test,
    stateWithShownTest,
    makeGetRandomInteger()
  );

/**
 *
 */
export const getRogueUpdater_empty = (rogue: RogueData) =>
  makeRogueUpdater(rogue, makeGetRandomInteger())(defaultState);

/**
 *
 */
export const getRogueUpdater_with_tests = (rogue: RogueData) =>
  makeRogueUpdater(rogue, makeGetRandomInteger())(stateWithTests);

/**
 *
 */
export const getRogueUpdater_with_test_reports = (rogue: RogueData) =>
  makeRogueUpdater(rogue, makeGetRandomInteger())(stateWithTestReports);
