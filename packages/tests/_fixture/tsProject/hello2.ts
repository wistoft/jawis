import { indent } from "^myAliasForJabs";
import * as fs from "fs";
import deepEqual from "deep-equal";

console.log(indent(""), deepEqual(1, 2), fs.existsSync("bla"));
