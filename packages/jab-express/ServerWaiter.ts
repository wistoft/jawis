import { getServerWaiter, ServerCustomWaiter, Server, ServerDeps } from ".";

/**
 * hacky
 */
export class ServerWaiter extends Server {
  public waiter: ServerCustomWaiter;

  constructor(deps: ServerDeps) {
    super(deps);

    this.waiter = getServerWaiter(this.server, deps.onError, deps);
  }

  /**
   *
   */
  public waitForListening = () => this.waiter.waitForOpen();

  /**
   *
   */
  public waitForClose = () => this.waiter.waitForClose();
}
//
