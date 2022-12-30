import { assertNever, CompareFiles, HandleOpenFileInEditor } from "^jab";
import { ServerMessage, ClientMessage } from "^jatec";
import { WsMessageListener } from "^jab-express";

import {
  BehaviorProv,
  ClientComProv,
  TestLogsProv,
  TestExecutionControllerProv,
  TestListControllerProv,
} from "./internal";

type Deps = {
  absTestFolder: string;
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
    switch (msg.type) {
      case "stopRunning":
        deps.onToggleRunning();
        return;

      case "runAllTests":
        deps.onRunAllTests();
        return;

      case "runCurrentSelection":
        deps.onRunCurrentSelection();
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

      case "openTest":
        deps.handleOpenFileInEditor(msg, deps.absTestFolder);
        return;

      case "openFile":
        deps.handleOpenFileInEditor(msg);
        return;

      default:
        assertNever(msg, "Unknown client message type.");
    }
  };
