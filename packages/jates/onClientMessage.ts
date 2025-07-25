import { assertNever, CompareFiles, HandleOpenFileInEditor } from "^jab";
import { WsMessageListener } from "^jab-express";

import {
  ServerMessage,
  ClientMessage,
  getClientTestReport,
  ComposedTestFramework,
  BehaviorProv,
  ClientComProv,
  TestExecutionControllerProv,
  TestListControllerProv,
} from "./internal";

type Deps = {
  testFramework: ComposedTestFramework;
  handleOpenFileInEditor: HandleOpenFileInEditor;
  compareFiles: CompareFiles;
  onError: (error: unknown) => void;
} & ClientComProv &
  TestExecutionControllerProv &
  TestListControllerProv &
  BehaviorProv;

/**
 *
 */
export const makeOnClientMessage =
  (deps: Deps): WsMessageListener<ServerMessage, ClientMessage> =>
  async (msg) => {
    switch (msg.type) {
      case "toggleRunning":
        return deps.onToggleRunning();

      case "getAllTests":
        return deps.onGetAllTests();

      case "runAllTests":
        return deps.onRunAllTests();

      case "runCurrentSelection":
        return deps.onRunCurrentSelection();

      case "prependTests":
        return deps.prependTestList(msg.ids);

      case "acceptTestLogs": {
        //maybe do this in parallel
        for (const id of msg.testIds) {
          const { exp, cur } = await deps.testFramework.acceptTestLogs(id);

          deps.sendTestReport(getClientTestReport(id, exp, cur));
        }
        return;
      }

      case "acceptTestLog": {
        const { exp, cur } = await deps.testFramework.acceptTestLog(
          msg.testId,
          msg.logName
        );

        return deps.sendTestReport(getClientTestReport(msg.testId, exp, cur));
      }

      case "compareTestLog":
        return deps.testFramework
          .getTempTestLogFiles(msg.testId, msg.logName)
          .then(({ exp, cur }) => {
            deps.compareFiles(exp, cur);
          });

      case "openFile":
        return deps.handleOpenFileInEditor(msg);

      default:
        assertNever(msg, "Unknown client message type.");
    }
  };
