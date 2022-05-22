import { BeeDef, FinallyFunc } from "^jab";

import type { Bee, BeeListeners, MakeBee } from "^jab";
import { BeePreloader } from ".";

type Deps = {
  def: BeeDef;
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
        def: {
          filename: this.deps.def.filename,
          data: this.deps.def.data,
        },
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
