import { TestProvision } from "^jarun";

import { isSystemFrame } from "^util-javi/web";

//partially tested

export default ({ chk }: TestProvision) => {
  //not sure what to return in this case?

  chk(isSystemFrame({}));

  //node frames

  chk(isSystemFrame({ file: "fs.js" }));
  chk(isSystemFrame({ file: "events.js" }));
  chk(isSystemFrame({ file: "internal/modules/cjs/loader.js" }));
};
