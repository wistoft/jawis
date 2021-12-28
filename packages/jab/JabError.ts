import {
  cloneArrayEntries,
  clonedTos,
  ClonedValue,
  captureStack,
  fixErrorInheritance,
} from ".";

/**
 * An replacement for Error, that supports capturing variable with the error message.
 *
 * impl
 *  - methods can't be "properties", because super is called in constructor.
 *  - extends Error, so a maker function, so it can be used in test cases, that change `Error`
 */
export const makeJabError = () =>
  class JabError extends Error {
    public clonedInfo: ClonedValue[];
    public jabMessage: string;

    constructor(message: string, ...info: Array<unknown>) {
      const { clonedInfo, rawMessage } = safeCloneInfo(message, info);

      // make the Error return a reasonable message, if it's used as ordinary Error.
      super(rawMessage);

      fixErrorInheritance(this, JabError.prototype);

      this.clonedInfo = clonedInfo;
      this.jabMessage = message;
    }

    /**
     * Change the message associated with this error object.
     *
     * - This will not update the message in the stack. But that should never be a problem, as that's "junk" data, anyway.
     */
    public reset(message: string, ...info: Array<unknown>): void {
      const { clonedInfo, rawMessage } = safeCloneInfo(message, info);

      this.message = rawMessage;

      this.clonedInfo = clonedInfo;
      this.jabMessage = message;
    }

    /**
     * Return the error message, cloned info and the stack, with information about how to parse it.
     */
    public getErrorData(extraInfo: Array<unknown> = []) {
      return {
        msg: this.jabMessage,
        info: [...this.clonedInfo, ...cloneArrayEntries(extraInfo)],
        stack: captureStack(this),
      };
    }
  };

//maybe this should be done by user. After module load. Would give better control over what `Error` is extended.
export const JabError = makeJabError();

//
// util
//

/**
 *
 * - Ensure errors during cloning is caught, and a panic error message is shown.
 */
export const safeCloneInfo = (message: string, info: Array<unknown>) => {
  try {
    const clonedInfo = cloneArrayEntries(info);

    const rawInfo = clonedInfo.reduce<string>(
      (acc, cur) => acc + "\n" + clonedTos(cur),
      ""
    );

    const rawMessage = message + rawInfo;

    return { rawMessage, clonedInfo };
  } catch (e) {
    const panicMsg = "JabError.safeCloneInfo() - error during clone:";

    console.log(panicMsg, e);

    //fail safe

    return { rawMessage: message, clonedInfo: [panicMsg, "" + e] };
  }
};
