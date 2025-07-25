import { err } from "^jab";

import { Bee, BeeDeps, HoneyComb, MakeBee } from "./internal";

export type DefaultHoneyCombDeps<C extends string = string> = {
  certainBees: Map<C, MakeBee>;
  suffixBees: Map<string, MakeBee>;
};

/**
 *
 */
export class DefaultHoneyComb<C extends string = string>
  implements HoneyComb<C>
{
  constructor(private deps: DefaultHoneyCombDeps<C>) {}

  /**
   *
   */
  public isBee = (filename: string) => {
    for (const suffix of this.deps.suffixBees.keys()) {
      if (filename.endsWith(suffix)) {
        return true;
      }
    }

    return false;
  };

  /**
   *
   */
  public makeBee = <MR extends {}>(beeDeps: BeeDeps<MR>) => {
    for (const suffix of this.deps.suffixBees.keys()) {
      if (beeDeps.def.filename.endsWith(suffix)) {
        const makeBee = this.deps.suffixBees.get(suffix);

        return makeBee!(beeDeps);
      }
    }

    throw err("Unknown bee: ", beeDeps.def.filename);
  };

  /**
   *
   */
  public makeCertainBee = <MS extends {}, MR extends {}>(
    type: C,
    beeDeps: BeeDeps<MR>
  ) => {
    const makeBee = this.deps.certainBees.get(type);

    if (!makeBee) {
      throw new Error("Can't make bee of type: " + type);
    }

    return makeBee(beeDeps) as Bee<MS>;
  };

  /**
   *
   */
  public makeMakeCertainBee =
    (type: C) =>
    <MS extends {}, MR extends {}>(deps: BeeDeps<MR>) =>
      this.makeCertainBee<MS, MR>(type, deps);
}
