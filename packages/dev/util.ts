import path from "node:path";
import { assertAbsolute } from "^jab-node";
import { AbsoluteFile, GetAbsoluteSourceFile } from "^jabc";

/**
 *
 */
export const getAbsoluteSourceFile_dev: GetAbsoluteSourceFile = (
  deps
): AbsoluteFile => assertAbsolute(path.join(deps.folder, deps.file + ".ts"));
