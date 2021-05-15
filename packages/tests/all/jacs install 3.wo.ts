import { assert } from "^jab";
import { install } from "^jacs";
import {
  getWorkerData,
  uninstallLiveJacs,
} from "^tests/_fixture/testFixtures/jacs";

uninstallLiveJacs();

//install

install(getWorkerData());

//jacs decorates errors with rawLine and rawFile

const error = new Error("hej");

//it's not set before error.stack is accessed.

assert((error as any).__jawisNodeStack === undefined);

//it's set when error.stack is accessed

error.stack; //the magic

if (!("__jawisNodeStack" in error)) {
  throw new Error("__jawisNodeStack not set");
}
