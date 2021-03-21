import { TestProvision } from "^jarun";
import ErrorStackParser from "error-stack-parser";

// when no func name and space in filename, a garbage func name is returned.

export default (prov: TestProvision) => {
  // shown without dependence on execution environment

  prov.imp(
    ErrorStackParser.parse({
      stack: `Error: dav
      at funcName (/file.js:1:2)
      at funcName (/space in file.js:1:2)
      at /file.js:1:2
      at /space in file.js:1:2
      `,
    } as Error).map((elm) => elm.functionName)
  );

  // bug show because this file has a space in it, and there's no function name for anonymous functions.

  (() => {
    prov.imp(
      ErrorStackParser.parse(new Error(`dav`)).map((elm) => elm.functionName)
    );
  })();
};
