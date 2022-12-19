import { nightmare, sleeping } from "^yapu";
import { TestProvision } from "^jarun";
import { asyncCapture } from "^async-capture";

export default (prov: TestProvision) =>
  asyncCapture([nightmare(20, "dav")], 10, prov.imp).then((data) => {
    prov.imp("original:", data);

    return sleeping(30);
  });
