import { def } from "^jab";

/**
 *
 * - onStdio callback is called with each line, making it easy to handle the stdio stream.
 * - onStdio callback is called with undefined, when the line is fully filtered.
 * - If a partial line is received, it might be emitted without filtering.
 * - timeout tells when buffered data is emitted, if it hasn't been terminated by a newline.
 * - If timeout is 0, flush will be performed sync. (useful for testing)
 *
 * impl
 *  - By ensuring we can handle re-entry for async cases, we ensure all async workloads are handled.
 *      It's a slightly stricter constraint, but it makes writing test cases easy, because they are sync,
 *        and any async sequence can be simulated that way.
 *      re-entry isn't that important to support. Async consistency is a must, however.
 *      That's why sync re-entry isn't implemented.
 *
 * states
 *  state 1: No buffered data and no active timeout handle.
 *  state 2: Buffered data and active timeout handle.
 */
export const makeStdioFilter = (
  onStdio: (str?: string) => void,
  includeLine: (str: string) => boolean,
  timeout = -1
) => {
  let buffer = "";
  let handle: any;

  return (data: Buffer | string) => {
    //use buffer from previous data

    const str = buffer + data.toString();

    buffer = "";

    //begin

    const lines = str.split("\n");

    //handle partial lines

    if (!str.endsWith("\n")) {
      //without newline, we can't determine if line should be ignored yet.

      buffer = def(lines.pop());

      //set timer, if not already set. And the timeout parameter tells us to.

      if (timeout >= 0 && handle === undefined) {
        handle = setTimeout(() => {
          //must be done first, so a new timer is set, in case of re-entry.

          handle = undefined;

          //output

          if (includeLine(buffer)) {
            // console.log("out", buffer);
            const tmp = buffer + "\n";
            buffer = ""; //must be done before call to external, so the state is correct for possible re-entry.
            onStdio(tmp);
          } else {
            onStdio();
          }
        }, timeout);
      }
    } else {
      //cancel the timer. It's not needed anymore.

      if (handle) {
        clearTimeout(handle);
        handle = undefined;
      }
    }

    //the final newline gives a meaningless empty string, which must be ignored.

    if (str.endsWith("\n")) {
      lines.pop();
    }

    //output

    for (const line of lines) {
      if (includeLine(line)) {
        //This can also cause re-entry. But that will only cause the stdio lines to be out of order.
        onStdio(line + "\n");
      } else {
        onStdio();
      }
    }
  };
};
