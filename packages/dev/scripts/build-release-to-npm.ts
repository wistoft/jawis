import { makeLiveJawisBuildManager } from "./build";
import { topologicalSortObject } from "^assorted-algorithms";

/**
 *
 */
export const doit = async () => {
  const builder = makeLiveJawisBuildManager();

  const allowPrivate = false;

  const tmp = await builder.getAllPackageDeps(false, allowPrivate);

  let sorted = topologicalSortObject(tmp as any) as string[];

  console.log(
    sorted
      .map(
        (elm) =>
          "cd " +
          elm +
          " && npm publish --tag dev --access public --loglevel warn -otp="
      )
      .join("\n")
  );
};

doit();
