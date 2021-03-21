import ErrorStackParser from "error-stack-parser";
import StackTrace from "stacktrace-js";
import { base64ToBinary, binaryToBase64, JabError } from "^jab";
import { assert } from "@wistoft/jab";

export default () => {
  console.log(
    base64ToBinary(
      binaryToBase64("Man is distinguished, not only by his reason, but ...")
    )
  );
};
