import { ErrorData, ParsedErrorData } from "^jab";
import { parseTrace } from "^parse-stack";

//duplicated
export const filterErrorMessage = (msg: string) => msg.replace(/^Error: /, "");

/**
 * Produce a parsed stack for ViewException component.
 */
export const parseErrorData = (error: ErrorData): ParsedErrorData => ({
  ...error,
  parsedStack: parseTrace(error.stack),
});
