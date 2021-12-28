/**
 *
 */
export type LogProv = {
  /**
   * for logging javascript variables.
   */
  log: (...args: Array<unknown>) => void;

  /**
   * for logging things like stdout.
   */
  logStream: (logName: string, value: string | Uint8Array) => void;

  /**
   * for reporting status.
   */
  status: (type: string, status: string) => void;
};

//
// not found in official places
//

export interface Jsonable {
  [x: string]:
    | string
    | number
    | boolean
    | Date
    | Jsonable
    | JsonableArray
    | undefined;
}

type JsonableArray = Array<
  string | number | boolean | Date | Jsonable | JsonableArray
>;
