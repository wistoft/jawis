import path from "path";
import urlJoin from "url-join";

import { lazyMakeMakeSshBee, SshDeps } from "^util-javi/node";

import { BuzzStore } from "^jabro";
import { makeCommandBee, makePowerBee } from "^jab-node";

import {
  BeeFrostClientMessage,
  BeeFrostServerMessage,
  WsBuzzStore,
} from "^jabroc";
import { assertNever, BeeDeps, err, HoneyComb } from "^jab";

/**
 *
 */
export const makeHoneyComb = (deps: {
  compileServiceRoot: string;
  webcsUrl: string;
  ymerUrl: string;
  sshDeps?: SshDeps;
}) => {
  const wsBuzzStore = makeWsBuzzStore(deps);
  const makeSshBee = deps.sshDeps
    ? lazyMakeMakeSshBee(deps.sshDeps)
    : () => {
        throw err("Not configured to run ssh bees.");
      };

  /**
   *
   */
  const makeWebWorkerBee = <MR extends {}>(beeDeps: BeeDeps<MR>) => {
    //
    const makeBee = wsBuzzStore.tryGetOne();

    if (makeBee === undefined) {
      throw err("Has no places to run browser bees.");
    }

    //turn into relative to what the compile service knows.

    const relFile = path.relative(deps.compileServiceRoot, beeDeps.filename);

    //turn into an url, that hit the compile service.

    const fileUrl = urlJoin(deps.webcsUrl, relFile);

    //make

    return makeBee({ ...beeDeps, filename: fileUrl });
  };

  /**
   *
   */
  const makeCertainBee = <MR extends {}>(
    type: "ww" | "ssh",
    beeDeps: BeeDeps<MR>
  ) => {
    switch (type) {
      case "ww":
        return makeWebWorkerBee(beeDeps);

      case "ssh":
        return makeSshBee(beeDeps);

      default:
        return assertNever(type);
    }
  };

  const honeyComb: HoneyComb = {
    /**
     *
     */
    isBee: (filename: string) =>
      filename.endsWith(".br.js") ||
      filename.endsWith(".br.ts") ||
      filename.endsWith(".ps1") ||
      filename.endsWith(".cmd") ||
      (deps.sshDeps !== undefined &&
        (filename.endsWith(".ssh.js") || filename.endsWith(".ssh.ts"))),

    /**
     *
     */
    makeCertainBee,

    /**
     *
     */
    makeBee: <MR extends {}>(beeDeps: BeeDeps<MR>) => {
      if (
        beeDeps.filename.endsWith(".br.js") ||
        beeDeps.filename.endsWith(".br.ts")
      ) {
        return makeWebWorkerBee(beeDeps);
      } else if (
        beeDeps.filename.endsWith(".ssh.js") ||
        beeDeps.filename.endsWith(".ssh.ts")
      ) {
        return makeSshBee(beeDeps);
      } else if (beeDeps.filename.endsWith(".ps1")) {
        return makePowerBee(beeDeps);
      } else if (beeDeps.filename.endsWith(".cmd")) {
        return makeCommandBee(beeDeps);
      } else {
        throw err("Unknown bee: ", beeDeps.filename);
      }
    },
  };

  return {
    honeyComb,
    browserBeeFrost: wsBuzzStore,
  };
};

/**
 *  - `this.register` is called when a web socket is ready to serve at communication channel.
 *  - `this.makeBee` can be used to create bee, when the channel is open.
 */
const makeWsBuzzStore = (deps: { ymerUrl: string }): WsBuzzStore => {
  const store = new BuzzStore({ ...deps });
  const map: Map<any, (msg: BeeFrostClientMessage) => void> = new Map();

  return {
    ...store,
    register: (nws) => {
      const channel = {
        send: (msg: BeeFrostServerMessage) => {
          return nws.send({ type: "beeFrost", data: msg });
        },
      };

      //register

      const { unregister, onMessage } = store.register(channel);

      map.set(nws, onMessage);

      //ensure unregister on web socket close

      (nws as any).ws.on("close", unregister);
    },
    onMessage: (nws, msg) => {
      const onMessage = map.get(nws);

      if (!onMessage) {
        throw new Error("Don't know the web socket this message comes from.");
      }

      onMessage(msg);
    },
  };
};
