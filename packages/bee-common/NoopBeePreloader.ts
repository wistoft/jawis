import { FinallyFunc } from "^finally-provider";

import { MakeBee, BeePreloaderProv, BeeDeps } from "./internal";

type Deps = {
  makeBee: MakeBee;
  finally: FinallyFunc;
};

/**
 *
 */
export class NoopBeePreloader<MR extends {}, MS extends {}>
  implements BeePreloaderProv<MR, MS>
{
  /**
   *
   */
  constructor(private deps: Deps) {}

  /**
   *
   */
  public useBee = (deps: BeeDeps<MR>) =>
    Promise.resolve(this.deps.makeBee(deps));

  /**
   *
   */
  public shutdown = () => Promise.resolve();

  public cancel = () => Promise.resolve();

  public noisyKill = () => Promise.resolve();

  public kill = () => Promise.resolve();
}
