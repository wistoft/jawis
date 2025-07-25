import { TestProvision } from "^jarun";

import { makeStdioFilterNew } from "^stdio-filter/internal";

// windows newlines doesn't clear to start of line

export default (prov: TestProvision) => {
  const filter = makeStdioFilterNew({
    ignoreLiteralPrefixes: [">"],
    ignoreLiteralLines: ["to-ignore"],
    includeJson: () => true,
    onLineShown: (line) => prov.log("shown lines", line),
    streamOutput: (str: string) => prov.logStream("output", str),
  });

  filter("hej\r\ndav");
};
