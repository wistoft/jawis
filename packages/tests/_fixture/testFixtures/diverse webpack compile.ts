import { TestProvision } from "^jarun";
import { WebpackCompileService } from "^pack-util";
import { CompileService } from "^jabc";

import { getProjectPath } from ".";

//compile service

let compileService: CompileService;

/**
 *
 */
export const getTestNodepackCompileService = (prov: TestProvision) => {
  if (!compileService) {
    compileService = new WebpackCompileService({
      compileServiceRoot: getProjectPath(),
      onErrorData: prov.onErrorData,
      config: {
        target: "node",
        //this will externalize everything from node_modules
        // externals: makeNodeExternals(),
        library: {
          type: "commonjs2",
        },
      },
    });
  }

  return compileService;
};
