import { captureStack, err } from "^jab";

//test stack is accessed, so is called under the hood Error.prepareStackTrace

//we use live version of jacs, because this is a test of `captureStack`

const data = captureStack(new Error("hej"));

if (data.type !== "node-parsed") {
  throw err("expected 'node-parsed', was: ", data);
}
