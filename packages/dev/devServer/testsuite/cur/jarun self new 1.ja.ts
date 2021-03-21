import fs from "fs";
import { sleeping } from "^jab";
import { TestProvision } from "^jarun";

export default (prov: TestProvision) => {
  // prov.imp("hej");
  // throw new Error("def");
  // f(prov);
  // return sleeping(100);
};

const f = (prov: any) => {
  fs.promises.readFile("ASDFASDF");

  // .catch((error: any) => {
  //   prov.imp(error.stack);
  //   prov.imp(ErrorStackParser.parse(error).map((elm) => elm));
  // });
};
