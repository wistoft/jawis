import { MainFileDeclaration } from "^jab";
import { consoleCapture as consoleCaptureBase } from "^console";

export const consoleCaptureMainDeclaration: MainFileDeclaration = {
  type: "web-entry",
  file: "consoleCaptureMain",
  folder: __dirname,
};

/**
 *
 * todo
 *  1. Make custom 'window' to isolate from others.
 *  2. Store in local storage or have shared worker
 *  3. Make server api
 *  4. Send logs to server reliably.
 *
 */
export const consoleCapture = () => {
  consoleCaptureBase();
};
