import { RouteComponentProps } from "@reach/router";
import React, { useContext, useEffect } from "react";

import { useUseFirstRouteEffect } from "..";

/**
 * Accesses the `useFirstRouteEffect` from context.
 */
export const useFirstRouteEffect: typeof useEffect = (effect, deps?) => {
  const useFirstRouteEffect = useContext(UseFirstRouteEffectContext);

  useFirstRouteEffect(effect, deps);
};

/**
 *
 */
export const UseFirstRouteEffectContext = React.createContext<typeof useEffect>(
  () => {}
);

/**
 * Provide `useFirstRouteEffect` as a context.
 *
 * - Get location from <Router> by being a direct child.
 *
 */
export const UseFirstRouteEffectProvider: React.FC<RouteComponentProps> = ({
  location,
  children,
}) => {
  const useFirstRouteEffect = useUseFirstRouteEffect(location);

  return (
    <UseFirstRouteEffectContext.Provider value={useFirstRouteEffect}>
      {children}
    </UseFirstRouteEffectContext.Provider>
  );
};
