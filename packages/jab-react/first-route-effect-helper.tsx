import { useEffect, useState } from "react";

import { err } from "^jab";

import { useMemoDep } from "./internal";

type State = {
  firstRoute: string;
  isFirstRoute: boolean;
};

/**
 *
 * Provide a `useEffect`, that only fires on the first route.
 *
 * - Takes a location from React Router.
 * - Must be used just below the top <Router>, so this is ensured to always render,
 *    in order to recieve all route locations.
 * - This is pretty much only useful via a context, like implemented in UseFirstRouteEffectProvider.
 *
 *
 * impl
 *  - setState is not used. To avoid getting unneeded rerenders.
 */
export const useUseFirstRouteEffect = (location: any) => {
  if (!location || !location.key) {
    throw err("Expected the property location.key", location);
  }

  const [state] = useState<State>({
    firstRoute: location.key,
    isFirstRoute: true,
  });

  const { useFirstRouteEffect } = useMemoDep({ state }, createCallbacks);

  //track first route, but don't let react know anything about this.

  if (state.isFirstRoute && state.firstRoute !== location.key) {
    state.isFirstRoute = false;
  }

  //return the nice hook.

  return useFirstRouteEffect;
};

//
// methods
//

type CallbackDeps = {
  state: State;
};

/**
 *
 */
const createCallbacks = ({ state }: CallbackDeps) => {
  const useFirstRouteEffect: typeof useEffect = (effect, deps?) => {
    useEffect(() => {
      if (state.isFirstRoute) {
        return effect();
      }
    }, deps);
  };

  return {
    useFirstRouteEffect,
  };
};
