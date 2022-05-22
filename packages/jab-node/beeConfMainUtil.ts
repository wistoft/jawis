import path from "path";
import { MakeBee, BeeConf, composeBeeDefs } from "^jab";

/**
 *
 */
export const makeNodeConfMakeBee = (
  makeBee: MakeBee,
  conf: BeeConf
): MakeBee => {
  return (deps) => {
    const def = composeBeeDefs(
      {
        filename: path.join(__dirname, "beeConfMain.ts"),
        data: conf,
      },
      deps.def
    );

    return makeBee({ ...deps, def });
  };
};
