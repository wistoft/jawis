import { assert, assertNever, getRandomInteger } from "^jab";

/**
 * - Flush must be called to close the channel.
 *   it flushes content buffer when exit, no matter if it's inconsistent (i.e. in the middle of an ipc message.)
 */
export type JsonOverStdioNew<MS> = {
  stdioProtocolId: number;
  onStdout: (msg: Buffer) => void;
  onStderr: (msg: Buffer) => void;
  flush: () => void;
  send: (msg: MS) => void;
};

/**
 *
 * params
 *  write is the writable end of stdio. For the parent process it's stdin. For thechild process it's stdout.
 *  onMessage will receive messages from the channel.
 *  onStdio, onStderr will receive the stdio left, after messages has been parsed out.
 *
 */
export const makeJsonOverStdio = <MR extends {}, MS extends {}>(
  write: (str: string) => void,
  onMessage: (msg: MR) => void,
  onStdout_org: (msg: Buffer) => void,
  onStderr_org: (msg: Buffer) => void
): JsonOverStdioNew<MS> => {
  const stdioProtocolId = getRandomInteger();

  const { handleStdio: onStdout, flush: flush1 } = makeHandleStdio(
    onMessage,
    onStdout_org,
    stdioProtocolId
  );

  const { handleStdio: onStderr, flush: flush2 } = makeHandleStdio(
    onMessage,
    onStderr_org,
    stdioProtocolId
  );

  return {
    stdioProtocolId,
    onStdout,
    onStderr,
    flush: () => {
      flush1();
      flush2();
    },
    send: makeSend(write, stdioProtocolId),
  };
};

/**
 *
 */
export const openJsonOverStdio = <MR extends {}, MS extends {}>(
  write: (str: string) => void,
  onMessage: (msg: MR) => void,
  onStdin_org: (msg: Buffer) => void,
  stdioProtocolId: number
) => {
  //I don't think flush is needed for anything here, because this is the receiver end, so flush makes no sense.
  const { handleStdio: onStdin, flush } = makeHandleStdio(
    onMessage,
    onStdin_org,
    stdioProtocolId
  );

  return {
    onStdin,
    send: makeSend<MS>(write, stdioProtocolId),
  };
};

/**
 *
 */
export const makeSend =
  <MS extends {}>(write: (str: string) => void, stdioProtocolId: number) =>
  (msg: MS) => {
    write("\n" + stdioProtocolId);
    write(JSON.stringify(msg));
    write("\n\x1F");
  };

/**
 *
 * states
 *
 *  nothing
 *    - Start token not (partially) seen.
 *    - Buffer is empty.
 *
 *  start-token
 *    - Start token partially seen.
 *    - LowMark points to first relevant byte in current array.
 *    - Buffer is empty.
 *
 *  start-token-buffered
 *    - Start token partially seen.
 *    - Buffer contains start token. Nothing else.
 *
 *  message
 *    - Start token fully seen. End token not seen.
 *    - LowMark points to message start. Start token is dropped.
 *    - Buffer is empty.
 *
 *  message-buffered
 *    - Start token fully seen. End token not seen.
 *    - Buffer contains start token. Nothing else.
 *
 *
 */
export const makeHandleStdio = (
  _onMessage: (json: any) => void,
  _onStdio: (msg: Buffer) => void,
  stdioProtocolId: number
) => {
  const tokenId = ("" + stdioProtocolId).split("").map((str) => str.charCodeAt(0)); // prettier-ignore
  const startToken: number[] = [10, ...tokenId]; //10 for newline.
  const endByte = 31; // US char (\x1F, Unit Separator) is probably benign in terminals. And it's not valid in json.

  let state: "nothing" | "start-token" | "start-token-buffered" | "message" | "message-buffered" | "done" = "nothing"; // prettier-ignore
  let startTokenBytesSeen = -1;
  let tokenStartIndex = -1; //set when entering start-token state

  let buffers: Buffer[] = [];
  let lowMark = 0; //indicate the first byte in current buffer, we still need to process.

  //what else to do
  const onStdio = (msg: Buffer) => {
    try {
      _onStdio(msg);
    } catch (error) {
      setTimeout(() => {
        throw error;
      }, 0);
    }
  };

  //what else to do
  const onMessage = (msg: any) => {
    try {
      _onMessage(msg);
    } catch (error) {
      setTimeout(() => {
        throw error;
      }, 0);
    }
  };

  /**
   * when users think they are done
   *
   *  - emit all the data that has been buffered.
   *  - make any further use a hard error.
   *
   */
  const flush = () => {
    assert(state !== "done");

    if (buffers.length !== 0) {
      switch (state) {
        case "done":
        case "nothing":
        case "message":
        case "message-buffered":
          onStdio(Buffer.from("\nHad to flush in state: " + state + "\n"));
          break;

        case "start-token":
        case "start-token-buffered":
          //it's not an error to end in this state. Only part of the start-token has been seen,
          //  and that completely allowed, and like.
          break;

        default:
          return assertNever(state);
      }
    }

    for (let i = 0; i < buffers.length; i++) {
      onStdio(buffers[i]);
    }

    buffers = [];

    state = "done";
  };

  /**
   *
   */
  const onStartTokenSeen = (data: Buffer, currentIndex: number) => {
    assert(state === "start-token" || state === "start-token-buffered");

    //the two states:

    if (state === "start-token") {
      assert(buffers.length === 0);
      assert(tokenStartIndex >= lowMark);
      assert(currentIndex + 1 - tokenStartIndex === startToken.length);

      //Emit everything before the start-token.

      if (tokenStartIndex > lowMark) {
        onStdio(data.subarray(lowMark, tokenStartIndex));
      }

      //Drop the start token, by setting lowMark at current byte.

      lowMark = currentIndex + 1; //plus 1 to exclude the current byte, which is the last byte of the start token.
    } else {
      assert(lowMark === 0);

      //Drop buffered parts of start token.

      buffers = [];

      //Drop the part in current buffer, by setting lowMark at current byte.

      lowMark = currentIndex + 1; //plus 1 to exclude the current byte, which is the last byte of the start token.
    }
  };

  /**
   *
   */
  const checkInNothingState = (data: Buffer, i: number) => {
    if (data[i] === startToken[0]) {
      state = "start-token";
      startTokenBytesSeen = 1;
      tokenStartIndex = i;
    }
  };

  /**
   * Loop over all bytes in the given buffer. Continuing from the state that we left off.
   *
   * - We don't change buffers in this loop, because the loop index would have to be updated,
   *     and that's to hacky.
   */
  const loopThroughLastestBuffer = (data: Buffer) => {
    for (let i = 0; i < data.length; i++) {
      switch (state) {
        case "nothing":
          assert(buffers.length === 0);

          checkInNothingState(data, i);
          break;

        case "start-token":
          assert(buffers.length === 0); //then fall through
        case "start-token-buffered":
          //check current byte

          if (data[i] !== startToken[startTokenBytesSeen]) {
            for (let i = 0; i < buffers.length; i++) {
              onStdio(buffers[i]);
            }

            buffers = [];

            state = "nothing";

            //check if this char is the first char of the start token. (it's like being in nothing-state)

            checkInNothingState(data, i);

            break;
          }

          //it was fine

          startTokenBytesSeen++;

          //have we seen enough?

          if (startTokenBytesSeen === startToken.length) {
            onStartTokenSeen(data, i);

            //now we wait for end-byte. And buffer everything we see.

            state = "message";
          }

          break;

        case "message":
        case "message-buffered":
          if (data[i] === endByte) {
            let json: string;

            if (state === "message") {
              assert(buffers.length === 0);

              //Make a buffer, that only contains the message. Excluding the end-byte, which is invalid json.
              json = data.subarray(lowMark, i).toString(); // end=i will exclude the end-byte.

              lowMark = i + 1; //plus 1 to exclude the current end-byte
            } else {
              assert(lowMark === 0);

              //Make a buffer, that only contains the message. Excluding the end-byte, which is invalid json.
              const last = data.subarray(0, i); // end=i will exclude the end-byte.

              //Add it to buffers, so it's included in the json

              buffers.push(last);

              //join buffers

              json = buffers.reduce<string>((acc, cur) => acc + cur.toString(), "") // prettier-ignore

              lowMark = i + 1; //plus 1 to exclude the current end-byte
              buffers = [];
            }

            //send message

            try {
              onMessage(JSON.parse(json));
            } catch (error: any) {
              onStdio(Buffer.from("\nCould not parse json from stdio protocol:\n")); // prettier-ignore
              onStdio(Buffer.from(json));
            }

            // now start over

            state = "nothing";
          }
          break;

        case "done":
          throw new Error("Can not be used any more, in state done.");

        default:
          return assertNever(state);
      }
    }
  };

  /**
   *
   */
  const handleStdio = (data: Buffer) => {
    lowMark = 0;

    loopThroughLastestBuffer(data);

    //can we emit something.

    switch (state) {
      case "nothing": {
        assert(buffers.length === 0);

        //emit everything from low mark

        if (data.length > lowMark) {
          onStdio(data.subarray(lowMark));
        }

        break;
      }

      case "start-token": {
        assert(buffers.length === 0);

        //Emit everything before the start-token.

        if (tokenStartIndex > lowMark) {
          onStdio(data.subarray(lowMark, tokenStartIndex));
        }

        //add the rest to buffer.

        buffers = [data.subarray(tokenStartIndex)];

        state = "start-token-buffered";

        break;
      }

      case "start-token-buffered":
        //nothing emit
        break;

      case "message":
        buffers = [data.subarray(lowMark)];
        state = "message-buffered";
        break;

      case "message-buffered":
        buffers.push(data);
        break;

      case "done":
        throw new Error("Can not be used any more, in state done.");

      default:
        return assertNever(state);
    }
  };

  return { handleStdio, flush };
};
