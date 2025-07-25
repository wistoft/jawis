import fs from "node:fs";
import path from "node:path";
import { Request, Response } from "express";

import { makeMakeGeneralRouter, ParamsDictionary } from "^jab-express";
import { CompileService, err, mapErrorsForInclusionInJs } from "^jab";
import { assertAbsolute } from "^jab-node";

import { makeGetUrlToRequire } from "./internal";

type Deps = {
  port: number;
  mountPath: string;
  staticWebFolder: string;
  compileService: CompileService;
};

/**
 *
 */
export const makeWebcs = (deps: Deps) => {
  const webRootUrl = "http://localhost:" + deps.port;

  const webCsUrl = webRootUrl + "/" + deps.mountPath + "/";

  return {
    webCsUrl,
    getUrlToRequire: makeGetUrlToRequire({ ...deps, webRootUrl, webCsUrl }),
    makeRouter: makeMakeRouter(deps.compileService),
  };
};

/**
 * duplicated between `makeFileServer` and `webcs`
 */
const makeMakeRouter = (compileService: CompileService) =>
  makeMakeGeneralRouter({
    onGet: (req: Request<ParamsDictionary, any, any>, res: Response<any>) => {
      //protecting against exceptions, because we want to give them to caller in the right format
      Promise.resolve()
        .then(() => {
          if (!req.path.endsWith(".js") && !req.path.endsWith(".ts")) {
            err("Only handles js and ts files.", req.path);
          }

          let file = decodeURI(req.path);

          if (process.platform === "win32") {
            file = file.replace(/^\//, "");
          }

          if (file.includes("\\")) {
            throw new Error("File must not contain backslash: " + file);
          }

          if (!path.isAbsolute(file)) {
            throw new Error("File must be absolute: " + file);
          }

          if (!fs.existsSync(file)) {
            throw new Error("File not found: " + file);
          }

          return compileService.load(assertAbsolute(file)).then((code) => {
            res.type("js");
            res.send(code);
          });
        })
        .catch((error: unknown) => {
          //it's hard to extract to general express catcher, because it's not clear how to throw in browser
          res.type("js");
          res.send(mapErrorsForInclusionInJs([error]));
        });
    },
  });
