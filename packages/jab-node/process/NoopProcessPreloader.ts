import { FinallyFunc } from "^jab";

import type { Bee, BeeListeners, MakeBee } from "^jab";
import { BeePreloader } from ".";

type Deps = {
  filename: string;
  makeBee: MakeBee;
  finally: FinallyFunc;
};

/**
 *
 */
export class NoopProcessPreloader<MS extends {}> implements BeePreloader<MS> {
  /**
   *
   */
  constructor(private deps: Deps) {}

  /**
   *
   */
  public useProcess = <MR extends {}>(
    listeners: BeeListeners<MR>
  ): Promise<Bee<MS>> =>
    Promise.resolve(
      this.deps.makeBee({
        filename: this.deps.filename,
        finally: this.deps.finally,
        ...listeners,
      })
    );

  /**
   *
   */
  public shutdown = () => Promise.resolve();

  public cancel = () => Promise.resolve();

  public noisyKill = () => Promise.resolve();

  public kill = () => Promise.resolve();
}
