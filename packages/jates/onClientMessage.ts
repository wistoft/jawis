import { assertNever } from "^jab";
import { ServerMessage, ClientMessage } from "^jatec";
import { WsMessageListener } from "^jab-express";
import { compareFiles, handleOpenFileInVsCode } from "^util-javi/node";

import { BehaviorProv } from "./Behavior";
import { ClientComProv } from "./ClientComController";
import { TestLogsProv } from "./TestLogController";
import { TestExecutionControllerProv } from "./TestExecutionController";
import { TestListControllerProv } from "./TestListController";

type Deps = {
  absTestFolder: string;
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
            compareFiles(exp, cur);
          });
        return;

      case "openTest":
        handleOpenFileInVsCode(msg, deps.absTestFolder);
        return;

      case "openFile":
        handleOpenFileInVsCode(msg);
        return;

      default:
        assertNever(msg, "Unknown client message type.");
    }
  };
