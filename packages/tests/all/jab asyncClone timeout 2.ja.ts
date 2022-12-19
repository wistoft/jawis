import { asyncCapture } from "^async-capture";
import { TestProvision } from "^jarun";
import { sleeping, sleepingValue } from "^yapu";

export default (prov: TestProvision) =>
  asyncCapture([sleepingValue(20, "dav")], 10, prov.imp).then((data) => {
    prov.imp("original:", data);

    return sleeping(30).then(() => {
      prov.imp("original:", data);
    });
  });
