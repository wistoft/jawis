import { ZippedTestLog } from "^jatec";
import { TestProvision } from "^jarun";
import { getTestLogMatchType } from "^jatev/util";
import { getControlLinks } from "^jatev/ViewTestLog";
import { errorData1 } from "../_fixture";

export default ({ eq }: TestProvision) => {
  //rogue gets no controls

  eq( null, getControlLinks_({ type: "user", name: "rogue.imp", exp: [], cur: [], }) ); // prettier-ignore

  //chk log gets no controls

  eq( null, getControlLinks_({ type: "chk", name:"chk", exp: 1, cur: 2, stack: errorData1.stack, }) ); // prettier-ignore
};

//
// util
//

const getControlLinks_ = (testLog: ZippedTestLog) =>
  getControlLinks(getTestLogMatchType(testLog), testLog, "dummyId", () => {});
