import fs from "node:fs";
import os from "node:os";
import { getBeeProv } from "^bee-node";
import { openJsonOverStdio } from "^stdio-protocol";
import { assert, assertNever, isInt } from "^jab";
import { BeeDef } from "^bee-common";
import { MessageBroker } from "./internal";

export type RemoteBooterMessage =
  | {
      type: "ready";
    }
  | {
      type: "script-required";
    };

export type ControllerMessage = {
  type: "startBee";
  def: BeeDef;
  beeCode: string;
  beeChannelToken: string;
};

/**
 *
 */
export const booter2Main = () => {
  const stdioProtocolId = (global as any).stdioProtocolId;

  assert(isInt(stdioProtocolId), "stdioProtocolId must be integer", [ { stdioProtocolId }, ]); // prettier-ignore

  //message broker

  const broker = new MessageBroker({ stdin: process.stdin });

  //start stdio-protocol

  const onStdin_org = (data: Buffer) => {
    throw new Error("did not expect stdin: " + data.toString());
  };

  const { onStdin, send } = openJsonOverStdio(
    (str: string) => process.stdout.write(str),
    broker.fireEvent,
    onStdin_org,
    stdioProtocolId
  );

  //listeners

  process.stdin.on("data", onStdin);

  broker.registerOnMessage(makeOnMessage(send, broker));

  //send ready

  send({ type: "ready" });
};

//
// util
//

/**
 *
 */
export const makeOnMessage =
  (postMessage: (msg: any) => void, broker: MessageBroker) =>
  (msg: ControllerMessage) => {
    switch (msg.type) {
      case "startBee": {
        broker.clearListeners();

        // bee provision

        const beeProv = getBeeProv(msg.beeChannelToken, false, postMessage);

        // custom overwrites

        beeProv.importModule = async (filename: string) => {
          if (filename === msg.def.filename) {
            const file = os.tmpdir() + "/quick-fix-bee-file.js";

            fs.writeFileSync(file, msg.beeCode);

            return eval("require")(file);
          }

          throw new Error("importModule not supported");
        };

        beeProv.registerOnMessage = broker.registerOnMessage;
        beeProv.removeOnMessage = broker.removeOnMessage;

        //run the script

        beeProv
          .runBee(msg.def, true)
          //catch errors to avoid unhandled rejection noise.
          .catch(beeProv.onError)
          .finally(() => {
            //todo: must ensure this isn't mixed with messages from the started bee.
            beeProv.beeSend({ type: "script-required" });
          });

        break;
      }

      default:
        assertNever(msg.type);
    }
  };
