import { renderHook } from "@testing-library/react-hooks";

/**
 * Better version of renderHook.
 *
 * - arguments to the hook are taken as arguments after the hook. In rerender just the args.
 * - Errors are thrown, not returned. As is convention.
 * - rerender returns hook-result, as one would expect.
 * - No 'current' variable. It's confusing.
 *
 * impl
 *  - renderHook returns error-object. But we access `result.current`, so the error is thrown anyway.
 *  - initialProps can't be used, because it only support one argument.
 *
 * bug
 *  - there is no way to distinguish a rerender without args, meaning we should use last args. And
 *      a hook with optional args, that aren't supplied, meaning the hook uses a default value internally.
 */
export function renderHookImproved<H extends (...a: any[]) => any>(
  hook: H,
  ...args: Parameters<H>
) {
  //wrap hook to support arguments

  let argsQuickFix = args;

  const wrapped = () => hook(...argsQuickFix) as ReturnType<H>;

  //use renderHook

  const { result, rerender: originalRerender, unmount } = renderHook(wrapped);

  //provision

  let rerender = (...args: any) => {
    if (args.length !== 0) {
      argsQuickFix = args;
    }

    originalRerender();

    return result.current;
  };

  return {
    result: result.current,
    rerender: rerender as H & (() => ReturnType<H>),
    unmount,
  };
}
