import { ReactNode } from "react";

import { ComponentMenuProps } from "^jab-react";
import { JaviClientConf } from "^javic";

/**
 * - can't be with JaviDirector, because it's '.tsx', while `getClientConf` is '.ts'
 * - JaviClientConf is separated so end-user can configure those.
 */
export type JaviDirectorProps = {
  //for developement
  serverPort?: number;
  consolePanel?: ReactNode;
} & Partial<ComponentMenuProps> &
  JaviClientConf;
