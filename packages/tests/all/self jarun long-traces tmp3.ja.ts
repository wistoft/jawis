import { TestProvision } from "^jarun";
import { then } from "^yapu";

// perfect stack trace

declare const notDefined: any;

export default (prov: TestProvision) =>
  then(() => {
    const outer = () => {
      notDefined; //ReferenceErrors
    };

    outer();
  });
