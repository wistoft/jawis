import { TestProvision } from "^jarun";
import { addDataUpdate_empty } from "^tests/_fixture";

export default (prov: TestProvision) =>
  addDataUpdate_empty(prov, [
    { type: "log", context: "browser", logName: "myLog", data: ["dav"] },
  ]).then((state) => {
    prov.log("orginary log", state);
  });
