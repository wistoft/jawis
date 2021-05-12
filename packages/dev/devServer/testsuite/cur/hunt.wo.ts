import { parseTrace } from "@jawis/jawis-util/web";
import { captureStack } from "@jawis/jab";

try {
  (parseTrace as any)();
} catch (error) {
  console.log(captureStack(error));
  // throw error;
}
