import { DefaultHoneyComb, MakeBee } from "^bee-common";

import { JaviService } from "./internal";

type Configuration = {
  [_: string]: MakeBee;
};

/**
 *
 */
export const honeyCombService = async (deps: JaviService) => {
  //
  // certain
  //

  const certainBees_ = deps.getRootConfig<Configuration>(
    "@jawis/javi/honeyComb/certainBees"
  );

  const certainBees__: [string, MakeBee][] = [];

  for (const val of Object.entries(certainBees_)) {
    certainBees__.push([val[0], await deps.resolveService(val[1])]);
  }

  //
  // suffix
  //

  const suffixBees_ = deps.getRootConfig<Configuration>(
    "@jawis/javi/honeyComb/suffixBees"
  );

  const suffixBees__: [string, MakeBee][] = [];

  for (const val of Object.entries(suffixBees_)) {
    suffixBees__.push([val[0], await deps.resolveService(val[1])]);
  }

  //
  // return
  //

  return new DefaultHoneyComb({
    certainBees: new Map(certainBees__),
    suffixBees: new Map(suffixBees__),
  });
};
