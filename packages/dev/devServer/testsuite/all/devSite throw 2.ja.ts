import { getRandomInteger, sleeping } from "^jab";
import { TestProvision } from "^jarun";

export default (prov: TestProvision) => {
  console.log(getRandomInteger(234));

  return sleeping(500);
};
