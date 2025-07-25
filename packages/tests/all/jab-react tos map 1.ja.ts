import { TestProvision } from "^jarun";
import { getPrettyHtml, getDefaultConf } from "../_fixture";

export default async ({ imp }: TestProvision) => {
  imp(getDefaultConf().mapToAtoms);
  imp(getDefaultConf().atoms);
  imp(
    await Promise.all(
      Object.entries(getDefaultConf().mapToFinal).map(async ([key, value]) => {
        if (typeof value === "string") {
          return [key, value];
        } else {
          return [key, await getPrettyHtml(value)];
        }
      })
    )
  );
};
