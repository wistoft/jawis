import { asyncClone, nightmare, sleeping } from "^jab";
import { TestProvision } from "^jarun";

export default (prov: TestProvision) =>
  asyncClone([nightmare(20, "dav")], 10, prov.imp).then((data) => {
    prov.imp("original:", data);

    return sleeping(30);
  });
