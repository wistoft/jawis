import React from "react";

let monkeyPatched = false;

/**
 *
 */
export const ensureMonkeyPatchUseEffect_e1 = () => {
  if (monkeyPatched) {
    return;
  }
  monkeyPatched = true;
  monkeyPatchUseEffect_e1();
};

/**
 *
 */
export const monkeyPatchUseEffect_e1 = () => {
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
