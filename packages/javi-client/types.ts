import { ReactNode } from "react";

import { ComponentMenuProps } from "^jab-react";
import { Props as JagovProps, ConsoleProps } from "^jagov";
import { Props as JatevProps } from "^jatev";

/**
 * - can't be with JaviDirector, because it's '.tsx', while `getClientConf` is '.ts'
 * - JaviClientConf is separated for so end-user can configure those.
 */
export type JaviDirectorProps = {
  //for developement
  serverPort?: number;
  consolePanel?: ReactNode;
} & Partial<Omit<ComponentMenuProps, "provideFirstRouteEffect">> &
  JaviClientConf;

/**
 * - All the configuration that comes from server. But not the props that are directly for JaviDirector.
 */
export type JaviClientConf = Omit<JatevProps, "apiPath"> &
  Omit<JagovProps, "apiPath"> &
  Omit<ConsoleProps, "apiPath" | "useConsoleStream">;
