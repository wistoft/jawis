import path from "path";

import { Client, ConnectConfig } from "ssh2";

import { MakeBee, BeeDeps, tryProp, FinallyFunc, assert, LogProv } from "^jab";

import { BuzzController } from "^jabro";
import { SshProtoBee } from "./SshProtoBee";
import { BeeFrostServerMessage } from "^jabroc";
import { makeOnJsonOverStdout } from ".";

export type SshDeps = {
  sshConfig: ConnectConfig;

  onError: (error: unknown) => void;
  finally: FinallyFunc;
  logProv: LogProv;
};

/**
 *
 * - This makes it possible to delay making the ssh connection to the bee be is made.
 */
export const lazyMakeMakeSshBee = (deps: SshDeps): MakeBee => {
  let makeSshBee: MakeBee;

  return <MS, MR>(beeDeps: BeeDeps<MR>) => {
    if (!makeSshBee) {
      makeSshBee = makeMakeSshBee(deps);
    }

    return makeSshBee<MS, MR>(beeDeps);
  };
};

export type State = {
  endConn: boolean;
  closeConn: boolean;
};

/**
 *
 */
export const makeMakeSshBee = (deps: SshDeps): MakeBee => {
  const state: State = {
    endConn: false,
    closeConn: false,
  };

  let isReady = false;

  const conn = new Client();

  //ensure clean shutdown

  deps.finally(() => {
    //todo: need to wait for connection to exit here.
    return conn.end();
  });

  //hive facade

  const { protoBee, buzzController } = getBuzzController(conn, deps);

  //
  // callbacks
  //

  conn.on("ready", () => {
    isReady = true;
    protoBee.onReady();
  });

  //an error isn't thrown, if sshd is killed. The connection/stream is just ended normally.
  //errors, that happen at establish connection.
  //errors thrown in callbacks for stream and connection.
  conn.on("error", (error) => {
    deps.onError(error);
  });

  conn.on("end", () => {
    if (state.endConn || state.closeConn) {
      console.log("makeMakeSshBee() - on conn end - unexpected state", state); // prettier-ignore
    }

    state.endConn = true;

    console.log("END conn");
  });

  //no need to call onExit on protoBee. It's stream will close before, this event fires.
  conn.on("close", (_hadError) => {
    if (isReady && (!state.endConn || state.closeConn)) {
      console.log("makeMakeSshBee() - on conn close - unexpected state", state); // prettier-ignore
    }

    state.closeConn = true;

    console.log("CLOSE conn");
  });

  //also: localAddress, localHostname

  //todo: extract to local conf file, and choose new 'secret' port.
  conn.connect(deps.sshConfig);

  //the maker

  return buzzController.makeBee;
};

/**
 * - SshProtoBee is used to control the ssh hive. It's not a proper bee itself.
 *
 */
export const getBuzzController = (conn: Client, deps: SshDeps) => {
  const outputBuffer: BeeFrostServerMessage[] = [];
  let ready = false;

  const realSend = (msg: BeeFrostServerMessage) => {
    protoBee.write(JSON.stringify(msg) + "\x00");
  };

  //todo: we must wait for sshMain to be ready. So we know it receives the data, rather than sshBooter.
  const send = (msg: BeeFrostServerMessage) => {
    if (ready) {
      realSend(msg);
    } else {
      outputBuffer.push(msg);
    }

    return Promise.resolve(); //todo: why this?
  };

  const onMessage = (data: any) => {
    //first message will bee ready-signal from sshMain

    if (tryProp(data, "type") === "ready") {
      assert(!ready, "already received ready signal.");
      ready = true;

      //this is sync, so it's guranteed, that the buffer is empties completely, before new messages can be sent.
      outputBuffer.forEach(realSend);
    } else {
      buzzController.onMessage(data);
    }
  };

  const protoBee = new SshProtoBee({
    conn,
    beeDeps: {
      filename: path.join(__dirname, "./sshMain.js"),
      onMessage: () => {
        throw new Error("not possible");
      },
      onLog: () => {
        throw new Error("not possible");
      },
      onStdout: makeOnJsonOverStdout(onMessage),
      onStderr: (data) => {
        deps.logProv.logStream("ssh.stderr", data);
      },
      onExit: () => {
        //todo: should we accept, if this happens. Or reconnect. Does it mean all bee have died?
      },
      finally: deps.finally,
      onError: deps.onError,
    },
  });

  const buzzController = new BuzzController({
    ymerUrl: "to be removed",
    send,
  });

  return { protoBee, buzzController };
};
