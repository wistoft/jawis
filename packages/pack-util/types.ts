//quick fix
export type WebpackExternalsFunc = (
  data: { request?: string; context?: string },
  callback: (
    err?: Error,
    result?: string | boolean | string[] | { [index: string]: any }
  ) => void
) => void;
