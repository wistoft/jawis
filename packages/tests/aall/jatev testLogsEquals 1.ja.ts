import { testLogsEqual } from "^jatec";
import { TestProvision } from "^jarun";
import { errorData1 } from "../_fixture";

export default ({ chk }: TestProvision) => {
  //
  //err logs
  //

  chk(testLogsEqual({ type: "err", name: "err", exp: [], cur: [] }));
  chk(testLogsEqual({ type: "err", name:"err", exp: ["hej"], cur: [{msg:"hej", info:[], stack: errorData1.stack}] })); // prettier-ignore

  chk(!testLogsEqual({ type: "err", name:"err", exp: [], cur: [{ msg: "hej", info: [], stack: errorData1.stack }], }) ); // prettier-ignore
  chk(!testLogsEqual({ type: "err", name: "err", exp: ["hej"], cur: [] }));
  chk(!testLogsEqual({ type: "err", name:"err", exp: ["hej"], cur: [{msg:"dav", info:[], stack: errorData1.stack}] })); // prettier-ignore

  //
  // chk log
  //

  //it ignores they are equal, because chk-log will only be thrown if, they are different.
  chk(!testLogsEqual({ type: "chk", name:"chk", exp: 1, cur: 1, stack: errorData1.stack }) ); // prettier-ignore

  //
  // user logs
  //

  chk(testLogsEqual({ type: "user", name: "imp", exp: [""], cur: [""] }));
  chk(testLogsEqual({ type: "user", name: "imp", exp: [{}], cur: [{}] }));

  chk(!testLogsEqual({ type: "user", name: "imp", exp: [1], cur: ["1"] }));
};
