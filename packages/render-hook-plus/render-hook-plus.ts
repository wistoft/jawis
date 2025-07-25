import { renderHook as originalRenderHook } from "@testing-library/react-hooks";
import { ensureMonkeyPatchUseEffect } from "./internal";

/**
 * Improved version of renderHook.
 *
 * - Arguments to the hook are taken as arguments after the hook.
 * - A `hook` function is returned, that takes the same arguments as the original hook.
 * - Errors are thrown, not returned.
 * - rerender returns hook-result.
 * - No 'current' variable.
 *
 * impl
 *  - renderHook returns error-object. But we access `result.current`, so the error is thrown there.
 *  - initialProps can't be used, because it only supports one argument.
 */
export function renderHook<H extends (...a: any[]) => any>(
  originalHook: H,
  ...args: Parameters<H>
) {
  ensureMonkeyPatchUseEffect();

  //wrap hook to support arguments

  let argsQuickFix = args;

  const wrapped = () => originalHook(...argsQuickFix) as ReturnType<H>;

  //use renderHook

  const prov = originalRenderHook(wrapped);

  //new provision

  const hook = (...args: Parameters<H>) => {
    argsQuickFix = args;

    prov.rerender();

    return prov.result.current;
  };

  const rerender = () => {
    prov.rerender();

    return prov.result.current;
  };

  return {
    ...prov,
    result: prov.result.current,
    hook: hook as H,
    rerender,
  };
}
