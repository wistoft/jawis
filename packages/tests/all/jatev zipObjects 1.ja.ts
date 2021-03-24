import { zipObjects } from "^jatec";
import { TestProvision } from "^jarun";

export default ({ imp, eq }: TestProvision) => {
  imp(
    zipObjects(
      {
        blabla: ["What you expect"],
        errMsg: ["some error"],
      },
      {
        blabla: ["What you expect"],
        errMsg: [""],
      }
    )
  );

  // only exp

  imp(zipObjects({ blabla: ["What you expect"] }, {}));
  eq([], zipObjects({ blabla: undefined }, {}));

  // only cur

  imp(zipObjects({}, { blabla: ["some value"] }));
  eq([], zipObjects({}, { blabla: undefined }));
};
