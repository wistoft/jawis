import AnsiParser from "node-ansiparser";

import { assert, isInt, isString } from "^jab";

type ParseEventCallbacks = {
  onPrint: (str: string) => void;
  onAction: (
    action:
      | "up"
      | "down"
      | "right"
      | "left"
      | "up-beginning"
      | "down-beginning",
    count: number
  ) => void;
  onAction2: (action: "erase-to-beginning") => void;
  setPosition: (x: number, y?: number) => void;
};

/**
 *
 */
export const makeAnsiParser = (callbacks: ParseEventCallbacks) => {
  const rawCallbacks = {
    inst_p: (str: string) => {
      assert(isString(str));

      callbacks.onPrint(str);
    },

    inst_x: function (flag: string) {
      // C0 or C1 control codes: https://en.wikipedia.org/wiki/C0_and_C1_control_codes

      assert(isString(flag));
      assert(flag.length === 1);
      // eslint-disable-next-line no-control-regex
      assert(flag.match(/^[\x00-\x1F\x80-\x9F]$/) !== null);

      switch (flag) {
        case "\x00":
        case "\t":
          callbacks.onPrint(flag);
          break;

        case "\r":
          callbacks.onAction2("erase-to-beginning");
          break;

        case "\n":
          callbacks.onAction("down-beginning", 1);
          break;

        default:
          console.log("unknown control code", flag.charCodeAt(0));
          break;
      }
    },

    /**
     *
     *
     * @see https://en.wikipedia.org/wiki/ANSI_escape_code#CSI_(Control_Sequence_Introducer)_sequences
     *
     * todo
     *  - it seems the defaults are not quite right.
     */
    inst_c: function (collected: string, params: any[], flag: string) {
      assert( collected === "" || collected === "=" || collected === "?", "unknown", { collected } ); // prettier-ignore

      switch (flag) {
        case "A":
          assert(params.length === 1);
          assert(isInt(params[0]));

          callbacks.onAction("up", params[0] === 0 ? 1 : params[0]);
          break;

        case "B":
          assert(params.length === 1);
          assert(isInt(params[0]));

          callbacks.onAction("down", params[0] === 0 ? 1 : params[0]);
          break;

        case "C":
          assert(params.length === 1);
          assert(isInt(params[0]));

          callbacks.onAction("right", params[0] === 0 ? 1 : params[0]);
          break;

        case "D":
          assert(params.length === 1);
          assert(isInt(params[0]));

          callbacks.onAction("left", params[0] === 0 ? 1 : params[0]);
          break;

        case "E":
          assert(params.length === 1);
          assert(isInt(params[0]));

          callbacks.onAction("down-beginning", params[0] === 0 ? 1 : params[0]);
          break;

        case "F":
          assert(params.length === 1);
          assert(isInt(params[0]));

          callbacks.onAction("up-beginning", params[0] === 0 ? 1 : params[0]);
          break;

        case "G":
          //default is 1. Zero from parser is not valid.

          assert(params.length === 1);
          assert(isInt(params[0]));

          callbacks.setPosition(params[0] === 0 ? 1 : params[0]);
          break;

        case "H": {
          assert(params.length === 1 || params.length === 2);

          const x = params[0] || 1; //turns both zero and undefined into default: 1
          const y = params[1] || 1;

          assert(isInt(x));
          assert(isInt(y));

          callbacks.setPosition(x, y);
          break;
        }

        case "J":
          throw new Error("clear display not supported");

        case "K":
          //works
          assert(params.length === 1);

          switch (params[0]) {
            case 0:
              console.log("erase-to-end");
              break;

            case 1:
              console.log("erase-to-beginning");
              break;

            case 2:
              console.log("erase-line");
              break;

            default:
              throw new Error("unknown param");
          }

          break;

        case "m": {
          //params vary

          const p = params.join(";");

          console.log("\x1b[" + p + "m");

          break;
        }

        case "S":
        case "T":
          throw new Error("scroll not supported");

        default:
          console.log("unknown csi", collected, params, flag);
          break;
      }
    },

    inst_o: function (s: string) {
      console.log("unkonwn osc", s);
    },

    inst_e: function (collected: any, flag: any) {
      console.log("unknown esc", collected, flag);
    },

    inst_H: function (collected: any, params: any, flag: any) {
      console.log("dcs-Hook", collected, params, flag);
    },
    inst_P: function (dcs: any) {
      console.log("dcs-Put", dcs);
    },
    inst_U: function () {
      console.log("dcs-Unhook");
    },
  };

  return new AnsiParser(rawCallbacks);
};
