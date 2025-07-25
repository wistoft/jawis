import { TestProvision } from "^jarun";

import { makeStdioFilter } from "^stdio-filter/internal";

export default (prov: TestProvision) => {
  const filter = makeStdioFilter({
    ignoreLiteralPrefixes: [">"],
    ignoreLiteralLines: ["to-ignore"],
    includeJson: () => true,
    streamOutput: (line) => prov.log("output", line),
    onLineShown: (line) => prov.log("shown lines", line),
    timeout: -1,
  });

  filter("to-ignore\n");
  filter(">to-ignore\n");
  filter("hej\n");
  filter(">hej\n");
};
