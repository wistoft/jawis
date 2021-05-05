import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";

import { err, assertNever } from "^jab";

import { HttpRequest } from "^dev-appc";

import { ActionProv } from "./ActionProvider";
import { BehaviorProv } from "./Behavior";

export type Deps = ActionProv & BehaviorProv;

/**
 *
 */
export const makeOnRequest = (deps: Deps) => (
  req: Request<ParamsDictionary, any, HttpRequest>,
  res: Response<any>
) => {
  if (typeof req.body !== "object") {
    throw err("Unexcepted body type.", req.body);
  }

  if (!req.body.type) {
    err("Action missing.");
  }

  switch (req.body.type) {
    case "getSomeJson":
      res.json({ status: "value", value: { msg: "hello client" } });
      return;

    case "sendErrMessage":
      res.json({
        status: "err",
        message: "error message from server",
      });
      return;

    case "sendInvalidResponseStatus":
      res.json({
        status: "blabla",
      });
      return;

    case "poisonBlankResponse":
      res.send("" as any);
      return;

    case "invalidErrorObject":
      throw "I'm just a string";

    case "poisonJabError":
      err("poisonJabError");
      return; //for typescript

    case "stopServer":
      process.exit();

    default:
      assertNever(req.body, "Unknown request type.");
  }
};
