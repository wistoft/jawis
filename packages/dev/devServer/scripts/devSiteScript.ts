import { BeeMain } from "^bee-common/types";
import { setStatus } from "^jagoc";

/**
 *
 */
export const main: BeeMain = (prov) => {
  let i = 0;

  let func = () =>
    setTimeout(() => {
      setStatus(++i + "%");

      if (i < 100) {
        func();
      }
    }, 100);

  func();
};
