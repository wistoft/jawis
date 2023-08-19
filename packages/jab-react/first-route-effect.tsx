import React, { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";

import { useUseFirstRouteEffect } from "./internal";

/**
 * Accesses the `useFirstRouteEffect` from context.
 */
export const useFirstRouteEffect: typeof useEffect = (effect, deps?) => {
  const useFirstRouteEffect = useContext(UseFirstRouteEffectContext);

  useFirstRouteEffect(effect, deps);
};

/**
 * Provide `useFirstRouteEffect` as a context.
 *
 * - Get location from <Router> by being a direct child.
 *
 */
export const UseFirstRouteEffectProvider: React.FC<any> = ({ children }) => {
  const location = useLocation();

  const useFirstRouteEffect = useUseFirstRouteEffect(location);

  return (
    <UseFirstRouteEffectContext.Provider value={useFirstRouteEffect}>
      {children}
    </UseFirstRouteEffectContext.Provider>
  );
};

/**
 *
 */
const UseFirstRouteEffectContext = React.createContext<typeof useEffect>(
  () => {}
);
