import { TestProvision } from "^jarun";

import { defaultWindowPropertyName } from "^console";
import { getHtml } from "^misc/node";
import { getConsole } from "../_fixture";

export default ({ imp }: TestProvision) => {
  (global as any).window = {
    [defaultWindowPropertyName]: {
      data: [],
    },
  };

  imp(getHtml(getConsole()));
};
