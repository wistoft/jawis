import { indent } from "^jab";
import * as fs from "fs";
import deepEqual from "deep-equal";

console.log(indent(""), deepEqual(1, 2), fs.existsSync("bla"));
