import * as fs from "fs";
import deepEqual from "deep-equal";
import { indent } from "^myAliasForJabs";

console.log(indent(""), deepEqual(1, 2), fs.existsSync("bla"));
