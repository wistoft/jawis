import { TestProvision } from "^jarun";
import { getPrettyHtml, getViewException } from "../_fixture";

export default async ({ log }: TestProvision) => {
  log(
    "no stack",
    await getPrettyHtml(
      getViewException({
        errorData: { msg: "Error message", info: [], parsedStack: [] },
      })
    )
  );
};
