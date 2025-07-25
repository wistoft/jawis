import { TestProvision } from "^jarun";

import { getPrettyHtml, getViewEntry } from "../_fixture";

export default async ({ imp }: TestProvision) => {
  imp(await getPrettyHtml(getViewEntry({})));
};
