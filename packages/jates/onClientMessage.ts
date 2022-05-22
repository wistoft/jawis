import { assertNever } from "^jab";
import { ServerMessage, ClientMessage } from "^jatec";
import { CompareFiles, HandleOpenFileInEditor } from "^util-javi/node";
import { WsMessageListener } from "^jab-express";

import { BehaviorProv } from "./Behavior";
import { ClientComProv } from "./ClientComController";
import { TestLogsProv } from "./TestLogController";
import { TestExecutionControllerProv } from "./TestExecutionController";
import { TestListControllerProv } from "./TestListController";
import { ComposedTestFramework } from "^jates";

type Deps = {
  testFramework: ComposedTestFramework;
  handleOpenFileInEditor: HandleOpenFileInEditor;
  compareFiles: CompareFiles;
  onError: (error: unknown) => void;
} & ClientComProv &
  TestExecutionControllerProv &
  TestListControllerProv &
  TestLogsProv &
  BehaviorProv;

/**
 *
 */
export const makeOnClientMessage =
  (deps: Deps): WsMessageListener<ServerMessage, ClientMessage> =>
  async (msg) => {
    switch (msg.action) {
      case "stopRunning":
        deps.onToggleRunning();
        return;

      case "getAllTests":
        deps.onGetAllTests();
        return;

      case "runAllTests":
        deps.onRunAllTests();
        return;

      case "runCurrentSelection":
        deps.onRunCurrentSelection();
        return;

      case "runDtp":
        deps.onRunDtp();
        return;

      case "prependTests":
        deps.prependTestList(msg.ids);
        return;

      case "acceptTestLogs": {
        //maybe do this in parallel
        for (const id of msg.testIds) {
          const report = await deps.acceptTestLogs(id);
          deps.sendTestReport(report);
        }
        return;
      }

      case "acceptTestLog": {
        const report = await deps.acceptTestLog(msg.testId, msg.logName);

        deps.sendTestReport(report);
        return;
      }

      case "compareTestLog":
        deps
          .getTempTestLogFiles(msg.testId, msg.logName)
          .then(({ exp, cur }) => {
            deps.compareFiles(exp, cur);
          });
        return;

      case "openTest": {
        const location = deps.testFramework.getTestLocation(msg.id);
        deps.handleOpenFileInEditor(location);
        return;
      }

      case "openFile":
        deps.handleOpenFileInEditor(msg);
        return;

      default:
        return assertNever(msg, "Unknown action.");
    }
  };
