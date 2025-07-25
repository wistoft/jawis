import { TestProvision } from "^jarun";
import { getAddDataUpdate_empty } from "^tests/_fixture";

export default (prov: TestProvision) =>
  getAddDataUpdate_empty([
    { type: "log", context: "browser", logName: "myLog", data: ["dav"] },
  ]);
