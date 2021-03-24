import { useEffect } from "react";

/**
 * Remove key listener at unmount.
 */
export const useKeyListener = (
  onKeydown: (e: KeyboardEvent) => void,
  target = document
) => {
  useEffect(() => {
    target.addEventListener("keydown", onKeydown);
    return () => {
      target.removeEventListener("keydown", onKeydown);
    };
  }, [onKeydown, target]);
};
