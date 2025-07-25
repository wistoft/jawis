import fs from "node:fs";
import path from "node:path";
import { platform } from "node:os";
import { Request, Response } from "express";

import { makeMakeGeneralRouter, ParamsDictionary } from "^jab-express";
import { err, mapErrorsForInclusionInJs } from "^jab";

import { Plugin, RouteDeclaration } from "./internal";

export type FileServerService = {
  url: string;
};

/**
 * todo: duplicated between `makeFileServer` and `webcs`
 */
export const makeFileServer = (
  serviceConfig: any
): Plugin<FileServerService> => {
  const port = serviceConfig["@jawis/javi/port"];

  const mountPath = "files";
  const rootUrl = "http://localhost:" + port;
  const url = rootUrl + "/" + mountPath + "/";

  const router: RouteDeclaration = {
    path: "/" + mountPath,
    make: () => makeMakeRouter()(),
  };

  return {
    service: {
      type: "service",
      instance: { url },
    },
    router,
  };
};

/**
 *
 */
const makeMakeRouter = () =>
  makeMakeGeneralRouter({
    onGet: (req: Request<ParamsDictionary, any, any>, res: Response<any>) => {
      //protecting against exceptions, because we want to give them to caller in the right format
      Promise.resolve()
        .then(() => {
          if (!req.path.endsWith(".js") && !req.path.endsWith(".js.map")) {
            err("Only handles js and js.map files.", req.path);
          }

          let file = decodeURI(req.path).replace(/^\//, "");

          if (file.includes("\\")) {
            throw new Error("File must not contain backslash: " + file);
          }

          //quick fix

          if (platform() === "linux") {
            if (!file.startsWith("/")) {
              file = "/" + file;
            }
          }

          if (!path.isAbsolute(file)) {
            throw new Error("File must be absolute: " + file);
          }

          if (!fs.existsSync(file)) {
            throw new Error("File not found: " + file);
          }

          return fs.promises.readFile(file).then((code) => {
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
