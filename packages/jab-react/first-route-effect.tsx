import React, {
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router-dom";

type State = {
  firstRoute: string;
  isFirstRoute: boolean;
};

/**
 *
 * - This doesn't take deps like useEffect does. Because this only runs once.
 */
export const useFirstRouteEffect = (effect: () => void | (() => void)) => {
  const alreadyDone = useRef(false);
  const isFirstRoute = useContext(IsFirstRouteContext);

  if (isFirstRoute === null) {
    throw new Error("UseFirstRouteEffectProvider must be in the react tree");
  }

  useEffect(() => {
    if (isFirstRoute && !alreadyDone.current) {
      alreadyDone.current = true;

      return effect();
    }
  });
};

/**
 * Provide context for first route effect.
 *
 */
export const IsFirstRouteEffectProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const location = useLocation();

  const [state] = useState<State>({
    firstRoute: location.key,
    isFirstRoute: true,
  });

  //track first route, but don't let react know anything about this.

  if (state.isFirstRoute && state.firstRoute !== location.key) {
    state.isFirstRoute = false;
  }

  return (
    <IsFirstRouteContext.Provider value={state.isFirstRoute}>
      {children}
    </IsFirstRouteContext.Provider>
  );
};

/**
 *
 */
const IsFirstRouteContext = React.createContext<boolean | null>(null);
