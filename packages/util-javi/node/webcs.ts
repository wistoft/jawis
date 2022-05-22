import { Request, Response } from "express";
import { makeRoute, ServerAppRouter } from "^jab-express";

import { ParamsDictionary } from "express-serve-static-core";

import { err } from "^jab";
import { CompileService } from "^jacs";

export type Deps = {
  compileService: CompileService;
};

/**
 *
 */
export const makeWebcsRoute = (deps: Deps): ServerAppRouter =>
  makeRoute({
    onGet: makeOnGet(deps),
  });

/**
 * todo: find a better api than (req, res, next)
 */
export const makeOnGet =
  (deps: Deps) =>
  (req: Request<ParamsDictionary, any, any>, res: Response<any>) => {
    if (!req.path.endsWith(".js") && !req.path.endsWith(".ts")) {
      err("Only handles js and ts files.");
    }

    deps.compileService
      .load(req.path)
      .then((code) => {
        res.type("js");
        res.send(code);
      })
      .catch((error: unknown) => {
        res.send("<pre>" + error + "</pre>");
      });
  };
