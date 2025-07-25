import { TestProvision } from "^jarun";

import { isSystemFrame } from "^view-exception";

export default ({ chk }: TestProvision) => {
  chk(isSystemFrame({}));

  //node frames

  chk(isSystemFrame({ file: "fs.js" }));
  chk(isSystemFrame({ file: "events.js" }));
  chk(isSystemFrame({ file: "internal/modules/cjs/loader.js" }));
};
