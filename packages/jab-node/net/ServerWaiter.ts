import { Server, Deps } from "./Server";
import { getServerWaiter, ServerCustomWaiter } from "./ServerCustomWaiter";

/**
 *
 */
export class ServerWaiter extends Server {
  public waiter: ServerCustomWaiter;

  constructor(deps: Deps) {
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
