import { MakeBee, BeeConf, composeBeeDefs } from "^bee-common";
import { GetAbsoluteSourceFile, MainFileDeclaration } from "^jab";
import { getAbsoluteSourceFile_live } from "^jab-node";

export const beeConfMainDeclaration: MainFileDeclaration = {
  type: "node-bee",
  file: "beeConfMain",
  folder: __dirname,
};

/**
 * todo: main file not implemented fully
 */
export const makeNodeConfMakeBee =
  (
    makeBee: MakeBee,
    conf: BeeConf,
    getAbsoluteSourceFile?: GetAbsoluteSourceFile
  ): MakeBee =>
  (deps) => {
    getAbsoluteSourceFile = getAbsoluteSourceFile ?? getAbsoluteSourceFile_live; // prettier-ignore

    const beeFile = getAbsoluteSourceFile(beeConfMainDeclaration);

    const def = composeBeeDefs(
      {
        filename: beeFile,
        data: conf,
      },
      deps.def
    );

    return makeBee({ ...deps, def });
  };
