
import { uninstall } from "../../../build-alpha/jacs";

console.log("_jacsUninstall" in (global as any));

uninstall();

console.log("_jacsUninstall" in (global as any));
