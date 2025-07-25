import { TestProvision } from "^jarun";
import { getTsCompileHost } from "^misc/tscs";

//write is cached

export default (prov: TestProvision) => {
  const { host, output } = getTsCompileHost({ options: {} });

  host.writeFile("file.ts", "dummy content", false);

  prov.eq("dummy content", output["file.ts"]);
};
