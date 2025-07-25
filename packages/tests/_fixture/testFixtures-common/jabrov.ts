import { BeeProvAndData } from "^bee-common/types";
import { assertNever, pathJoin } from "^jab/util";
import { BeeFrostClientMessage } from "^jabroc/types";
import { JabroHive, JabroHiveDeps } from "^jabrov/internal";
import { getProjectPath } from "..";

/**
 *
 */
export const getJabroHive_exit_with_worker = (
  prov: BeeProvAndData,
  extra?: Partial<JabroHiveDeps>,
  ymerUrl?: string
) =>
  getJabroHive(
    prov,
    {
      apiSend: (msg) => {
        testRelayBeeFrostClientMessage(msg, prov);

        if (msg.type === "exit") {
          prov.beeExit();
        }
      },
      ...extra,
    },
    ymerUrl
  );

/**
 *
 */
export const getJabroHive_log_first_message_and_exit = (
  prov: BeeProvAndData,
  extra?: Partial<JabroHiveDeps>,
  ymerUrl?: string
) =>
  getJabroHive(
    prov,
    {
      apiSend: (msg) => {
        console.log(filterBeeFrostClientMessage(msg));

        prov.beeExit();
      },
      ...extra,
    },
    ymerUrl
  );

/**
 *
 */
export const getJabroHive = (
  prov: BeeProvAndData,
  extra?: Partial<JabroHiveDeps>,
  ymerUrl?: string
) => {
  const projectRoot = getProjectPath();
  if (ymerUrl === undefined) {
    ymerUrl = pathJoin("http://localhost:3000/webcs/", projectRoot, "/packages/jabrov/ymer.ts"); // prettier-ignore
  }

  const hive = new JabroHive({
    apiSend: (msg) => {
      console.info(filterBeeFrostClientMessage(msg));
    },
    ...extra,
  });

  hive.onServerMessage({
    type: "setConf",
    webCsUrl: "http://localhost:3000/webcs/",
    ymerUrl,
  });

  return hive;
};

/**
 *
 */
export const testRelayBeeFrostClientMessage = (
  msg: BeeFrostClientMessage,
  prov: BeeProvAndData
) => {
  switch (msg.type) {
    case "stdout":
    case "stderr":
    case "message":
    case "exit":
      console.log(msg);
      return;

    case "error":
      //sensitive here for some reason. So couldn't use any functions.
      console.log({
        ...msg,
        data: {
          ...msg.data,
          stack: "filtered",
        },
      });
      return;

    case "log":
      prov.sendLog(msg.data);
      return;

    default:
      throw assertNever(msg, "Unknown client message.");
  }
};

/**
 *
 */
export const filterBeeFrostClientMessage = (msg: BeeFrostClientMessage) => {
  switch (msg.type) {
    case "stdout":
    case "stderr":
    case "message":
    case "exit":
      return msg;

    case "error":
      return "filtered quick fix";

    case "log":
      if (msg.data.type === "error") {
        return {
          ...msg,
          data: {
            ...msg.data,
            data: {
              ...msg.data.data,
              stack: "filtered",
            },
          },
        };
      } else {
        return msg;
      }

    default:
      throw assertNever(msg, "Unknown client message.");
  }
};
