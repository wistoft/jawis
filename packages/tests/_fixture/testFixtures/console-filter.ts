import { sleeping } from "^yapu";
import { TestProvision } from "^jarun";

import {
  makeStdioLinearizer_old,
  makeStdioInterpreter,
} from "^stdio-filter/internal";

const defaultIncludeLine = (line: string) => {
  return !["a", "b"].includes(line);
};

/**
 * Without flush on partial lines
 */
export const stdioLinearizerForTest_old = (input: string | string[]) => {
  let done = false;
  const arr = typeof input === "string" ? [input] : input;

  let result = "";

  const filter = makeStdioLinearizer_old((out) => {
    if (done) {
      throw new Error("Output after filter is finished.");
    }
    if (out !== undefined) {
      result += out;
    }
  }, defaultIncludeLine);

  arr.forEach((str) => {
    filter(str);
  });

  done = true;

  return result;
};

/**
 * Flushing partial lines after 0ms.
 */
export const stdioLinearizerWithFlushForTest = async (
  input: string | string[],
  includeLine: (line: string) => boolean = defaultIncludeLine
) => {
  const arr = typeof input === "string" ? [input] : input;

  let result = "";

  const filter = makeStdioLinearizer_old(
    (out) => {
      if (out !== undefined) {
        result += out;
      }
    },
    includeLine,
    0
  );

  for (const str of arr) {
    filter(str);
    await sleeping(50);
  }

  return result;
};

/**
 *
 */
export const makeStdioInterpreter_for_test = (prov: TestProvision) =>
  makeStdioInterpreter((lineNumber, line) => {
    prov.imp({ lineNumber, line });
  });

/**
 *
 */
export const stdioInterpreter_for_test = (strings: string[]) => {
  const result: { lineNumber: number; line: string }[] = [];

  const parser = makeStdioInterpreter((lineNumber, line) => {
    result.push({ lineNumber, line });
  });

  for (const str of strings) {
    parser(str);
  }

  return result;
};
