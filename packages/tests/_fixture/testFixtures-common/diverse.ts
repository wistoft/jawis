import { BeeProv } from "^bee-common/types";

export const setTestTimeout = (prov: BeeProv, timeout = 5000) => {
  setTimeout(() => {
    setTimeout(() => {
      prov.beeExit();
    }, 10);

    console.log("ww test case timeout");

    //timeout might be needed to catch this, because there is a delay for message to be sent to jabro.
    // throw new Error("test time out");
  }, timeout);
};
