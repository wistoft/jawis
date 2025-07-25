import { TestProvision } from "^jarun";

import { makeStdioFilterNew } from "^stdio-filter/internal";

export default (prov: TestProvision) => {
  const filter = makeStdioFilterNew({
    ignoreLiteralPrefixes: [">"],
    ignoreLiteralLines: ["to-ignore"],
    includeJson: () => true,
    onLineShown: (line) => prov.log("shown lines", line),
    streamOutput: (str: string) => prov.logStream("output", str),
  });

  filter("hej");
  filter("dav");
  filter("\n");
  filter("igen");
  filter("\nhej\n");

  filter("to-ignore\n");
  filter(">to-ignore\n");
  filter(">shown\n");
};
