import { asyncClone, sleeping, sleepingValue } from "^jab";
import { TestProvision } from "^jarun";

export default (prov: TestProvision) =>
  asyncClone([sleepingValue(20, "dav")], 10, prov.imp).then((data) => {
    prov.imp("original:", data);

    return sleeping(30).then(() => {
      prov.imp("original:", data);
    });
  });
