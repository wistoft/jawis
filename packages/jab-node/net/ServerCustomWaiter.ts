import http from "http";

import { err, safeRace, sleepingValue } from "^jab";

import { Deps } from "./Server";

export type WaiterServerSignalTypes = "open" | "data" | "close" | "never";

/**
 *
 */
export const getServerWaiter = (
  server: http.Server,
  onError: (error: unknown) => void,
  deps: Deps
) => {
  const waiter = new ServerCustomWaiter(onError, deps);

  server.on("listening", waiter.onListening);
  // server.on("message", waiter.onData);
  server.on("error", waiter.ownOnError);
  server.on("close", waiter.onClose);

  server.on("connect", () => {
    deps.log("connect");
  });

  return waiter;
};

/**
 * Should not be used directly.
 */
export class ServerCustomWaiter {
  private signal?: {
    type: WaiterServerSignalTypes;
    resolve: (data?: any) => void;
    reject: (error: unknown) => void;
  };

  /**
   * onError is for when the signal came after timeout.
   */
  constructor(private onError: (error: unknown) => void, public deps: Deps) {}

  /**
   *
   */
  public waitForOpen = (useTimeout = true) =>
    this.wait<undefined>("open", useTimeout);

  /**
   *
   */
  public waitForData = (useTimeout = true) =>
    this.wait<unknown>("data", useTimeout);

  /**
   *
   */
  public waitForClose = (useTimeout = true) => {
    console.log("buggy");
    this.wait<undefined>("close", useTimeout);
  };

  /**
   *
   */
  public wait = <T>(type: WaiterServerSignalTypes, useTimeout = true) => {
    const work = new Promise<T>((resolve, reject) => {
      if (this.signal !== undefined) {
        reject(new Error("Signal already registered."));
      }
      this.signal = { type, resolve, reject };
    });

    // no timeout

    if (!useTimeout) {
      return work;
    }

    // setup timeout

    const symbol = Symbol("timeout");

    const timeout = sleepingValue(300, symbol);

    return safeRace([work, timeout], this.onError).then((data) => {
      if (data === symbol) {
        err("Timed out waiting for: " + type);
      } else {
        return data;
      }
    });
  };

  /**
   *
   */
  public onListening = () => {
    if (this.signal) {
      if (this.signal.type === "open") {
        this.signal.resolve();
        this.signal = undefined;
      }
    }
  };

  /**
   *
   */
  public onData = (data: unknown) => {
    if (this.signal) {
      if (this.signal.type === "data") {
        this.signal.resolve(data);
        this.signal = undefined;
      }
    }
  };

  /**
   *
   */
  public ownOnError = (error: unknown) => {
    if (this.signal) {
      this.signal.reject(error);
      this.signal = undefined;
    }
  };

  /**
   *
   */
  public onClose = () => {
    if (this.signal) {
      if (this.signal.type === "close") {
        this.signal.resolve();
        this.signal = undefined;
      } else {
        this.signal.reject(new Error("Server closed while waiting."));
        this.signal = undefined;
      }
    }
  };
}
