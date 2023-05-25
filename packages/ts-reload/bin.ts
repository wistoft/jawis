import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";

import { main } from "./internal";

const argv = yargs(hideBin(process.argv))
  .scriptName("ts-reload")
  .usage(
    "$0 <files...>",
    "Compile and watch TypeScript/JavaScript files",
    (x) => x
  )
  .option("c", {
    alias: "config",
    string: true,
    describe: "Configuration file to use.",
  })
  .option("cr", {
    alias: "cache-resolve",
    boolean: true,
    default: true,
    describe: "Cache resolve, to speed up module load.",
  })
  .option("i", {
    alias: "index-prefix",
    boolean: true,
    default: false,
    describe: "Use script index as prefix. Otherwise name is used.",
  })
  .option("l", {
    alias: "lazy",
    boolean: true,
    default: false,
    describe: "Delay loading modules until they are needed.",
  })
  .option("lt", {
    alias: "long-traces",
    boolean: true,
    default: false,
    describe: "Include async stacks leading up to exception.",
  }).argv;

main(argv as any);
