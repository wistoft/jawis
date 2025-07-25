import React from "react";

let monkeyPatched = false;

/**
 *
 */
export const ensureMonkeyPatchUseEffect = () => {
  if (monkeyPatched) {
    return;
  }
  monkeyPatched = true;
  monkeyPatchUseEffect();
};

/**
 *
 */
export const monkeyPatchUseEffect = () => {
  const useEffectOriginal = React.useEffect;

  React.useEffect = (effect, deps) => {
    useEffectOriginal(() => {
      const unmount = effect();

      return () => {
        try {
          unmount && unmount();
        } catch (error) {
          setTimeout(() => {
            throw error;
          });
        }
      };
    }, deps);
  };
};
