import { TestProvision } from "^jarun";
import { testSelectionToCollection } from "^jatev/TestCollection";

export default (prov: TestProvision) => {
  testSelectionToCollection([]).getPrevTest();
};
