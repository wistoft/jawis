import { useEffect } from "react";

export type UseKeyListener = (
  onKeydown: (e: KeyboardEvent) => void,
  target?: typeof document
) => void;

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
