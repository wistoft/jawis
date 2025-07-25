import nativeModule from "node:module";

import { ModuleInternals } from "./internal";

export type FullNativeModule = typeof nativeModule & ModuleInternals;

//to get the full typing.
export const Module = nativeModule as unknown as FullNativeModule;
