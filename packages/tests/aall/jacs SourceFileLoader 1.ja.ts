import fs from "fs";
import { SourceFileLoader } from "^jacs/";
import { TestProvision } from "^jarun";

import { getScratchPath } from "../_fixture";
import { sleeping } from "^jab";

export default (prov: TestProvision) => {
  const sfl = new SourceFileLoader({ onError: prov.onError });

  const file = getScratchPath("hello.js");

  fs.writeFileSync(file, "//js code");

  return sfl
    .load(file)
    .then((data) => {
      prov.imp(data);

      return sleeping(50); //for filewatcher to start
    })
    .then(() => {
      fs.writeFileSync(file, "//new js code");

      return sleeping(50); //for change event to fire
    })
    .then(() => sfl.load(file).then(prov.imp))
    .then(() => {
      fs.writeFileSync(file, "//final js code");

      return sleeping(50); //for change event to fire
    })
    .then(() => sfl.load(file).then(prov.imp));
};
