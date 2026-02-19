import { TestProvision } from "^jarun";
import { getPromise } from "^yapu";

declare const notDefined: any;

export default (prov: TestProvision) => {
  const prom = getPromise<any>();

  setTimeout(() => {
    const inner = () => {
      setTimeout(() => {
        try {
          notDefined; //ReferenceErrors
        } catch (error: any) {
          prom.reject(error);
        }
      }, 0);
    };

    inner();
  }, 0);

  return prom.promise;
};
