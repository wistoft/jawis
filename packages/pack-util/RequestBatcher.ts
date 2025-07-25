import { getPromise, PromiseTriple } from "^yapu";

type Deps<A, B> = {
  onBatch: (requests: Request<A, B>[]) => Promise<unknown>;
};

export type Request<A, B> = {
  data: A;
  prom: PromiseTriple<B>;
};

/**
 * Let producer handle requests in batches (serially)
 *
 * - Returns a promise to every requester
 * - Queues when producer is working
 * - Calls producer with batches, when it's ready
 *
 */
export class RequestBatcher<A, B> {
  private requests: Request<A, B>[] = [];
  private working = false;

  /**
   *
   */
  constructor(private deps: Deps<A, B>) {}

  /**
   *
   */
  public request = (data: A) => {
    const prom = getPromise<B>();

    this.requests.push({
      data,
      prom,
    });

    this.tryStartBatch();

    return prom.promise;
  };

  /**
   * Todo: reject all queued requests if something fails.
   */
  public tryStartBatch = () => {
    if (this.requests.length === 0) {
      return;
    }

    if (!this.working) {
      this.working = true;

      const tmp = this.requests;
      this.requests = [];

      this.deps.onBatch(tmp).then(() => {
        this.working = false;
        this.tryStartBatch();
      });
    }
  };
}
