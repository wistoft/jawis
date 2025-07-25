import { TestProvision } from "^jarun";

import { getPrettyHtml, getView } from "../_fixture";

export default async ({ imp }: TestProvision) => {
  imp(await getPrettyHtml(getView()));
};
