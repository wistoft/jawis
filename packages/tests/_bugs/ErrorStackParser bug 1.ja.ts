import { TestProvision } from "^jarun";
import ErrorStackParser from "error-stack-parser";

//when error message looks like stack frame line, it's wrongly parsed as if it was part of the stack.

export default (prov: TestProvision) => {
  prov.imp(
    ErrorStackParser.parse(
      new Error(`dav
        at dummyFuncPartOfErrorMessage (JabError bug 1.ja.ts:8:15)
          `)
    ).map((elm) => elm.functionName)
  );
};
