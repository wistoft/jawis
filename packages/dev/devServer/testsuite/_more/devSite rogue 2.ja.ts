import { TestProvision } from "^jarun";
import { sleeping, sleepingValue } from "^jab";

export default (prov: TestProvision) => {
  return [
    sleeping(12000),
    sleepingValue(10, "hej"),
    sleepingValue(13000, "dav"),
  ];

  //   return sleeping(15000).then(() => {
  //     return 1;
  //   });
};
