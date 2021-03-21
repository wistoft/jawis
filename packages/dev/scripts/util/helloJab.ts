import * as jab from "^jab";

if (!jab.basename) {
  console.log();
}

if (!jab.basename("mikael/wistoft")) {
  console.log("unreach");
}
