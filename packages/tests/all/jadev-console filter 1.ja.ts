import { TestProvision } from "^jarun";

import { preserveConsoleEntry } from "^console/util";

export default ({ chk, ...prov }: TestProvision) => {
  chk(
    !preserveConsoleEntry({
      type: "log",
      logName: "error",
      data: ["The above error occurred in"],
      context: "",
    })
  );

  chk(
    !preserveConsoleEntry({
      type: "log",
      logName: "error",
      data: [
        `Warning: React.createElement: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s%s`,
      ],
      context: "",
    })
  );
};
