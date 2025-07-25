import { ErrorData } from "^jab";

//
// websocket - client message
//

export type ClientMessage =
  | CallMessage
  | {
      type: "openRelFile"; //relative to projectRoot
      file: string;
      line?: number;
    }
  | {
      type: "openFile";
      file: string;
      line?: number;
    };

export type CallMessage = {
  type: "call-function";
  id: number;
  func: string;
  args: string;
  path: string; //relative to projectRoot
};

//
// websocket - server message
//

export type ServerMessage =
  | FunctionResponse
  | FunctionException
  | {
      type: "ping all";
    };

export type FunctionResponse = {
  type: "function-response";
  id: number;
  value: unknown;
};

export type FunctionException = {
  type: "function-exception";
  id: number;
  func: string;
  error: ErrorData;
};

//
// more
//

export type Invoke = (func: string, ...args: any[]) => Promise<any>;
export type UseInvoke = (func: string, ...args: any[]) => any;

export type ComponentProvMap<
  Col extends { [func: string]: (...a: any[]) => any },
> = {
  invoke: (
    func: keyof Col,
    ...args: Parameters<Col[keyof Col]>
  ) => Promise<ReturnType<Col[keyof Col]>>;
  useInvoke: (
    func: keyof Col,
    ...args: Parameters<Col[keyof Col]>
  ) => ReturnType<Col[keyof Col]> | undefined;
};
