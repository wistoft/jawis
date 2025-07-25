import { TestProvision } from "^jarun";

import { getPrettyHtml, getViewLogEntry } from "../_fixture";

export default async ({ imp }: TestProvision) => {
  imp(await getPrettyHtml(getViewLogEntry()));
};
