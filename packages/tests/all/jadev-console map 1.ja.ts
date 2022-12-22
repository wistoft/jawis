import { TestProvision } from "^jarun";

import { ConsoleEntry } from "^console";
import { mapConsoleEntry } from "^console/util";

export default (prov: TestProvision) => {
  const entry: ConsoleEntry = {
    type: "log",
    logName: "error",
    data: ["some fine error"],
    context: "",
  };

  prov.eq(entry, mapConsoleEntry(entry));

  prov.imp(
    mapConsoleEntry({
      type: "error",
      data: {
        msg: "Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.\n\nCheck the render method of `MyComponent`.",
        info: [],
        stack: { type: "node", stack: "" },
      },
      context: "",
    })
  );
};
