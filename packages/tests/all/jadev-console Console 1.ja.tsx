import { TestProvision } from "^jarun";

import { defaultWindowPropertyName } from "^console";
import { getHtmlRTR } from "^misc/node";
import { getConsole } from "../_fixture";

export default ({ imp }: TestProvision) => {
  (global as any).window = {
    [defaultWindowPropertyName]: {
      data: [],
    },
  };

  imp(getHtmlRTR(getConsole()));
};
