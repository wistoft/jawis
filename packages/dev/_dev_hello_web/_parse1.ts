import ErrorStackParser from "error-stack-parser";
import StackTrace from "stacktrace-js";
import { JabError } from "^jab";

type fido = 1;
type fido2 = 1;

export default () => {
  throw new Error("sdf");
  (() => {
    let e = new Error(`dav`);
    console.log(e.stack);
  })();
};

const f = () => {
  let e = new Error(`dav`);

  // try {
  //   sdf;
  // } catch (unk) {
  //   e = unk;
  // }

  console.log(e.stack);

  // console.log(
  //   ErrorStackParser.parseV8OrIE(e)
  //   //.map((elm) => elm.functionName)
  // );

  // console.log(parseBacktrace(getUnparsedStack(e)));

  StackTrace.fromError(e).then((data) => {
    console.log(data.map((elm) => elm.lineNumber));
  });
};
