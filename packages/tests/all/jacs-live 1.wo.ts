// eslint-disable-next-line import/no-extraneous-dependencies
import { uninstall } from "@jawis/jacs";

console.log("_jacsUninstall" in (global as any));

uninstall();

console.log("_jacsUninstall" in (global as any));
