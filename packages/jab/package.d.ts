// quick fix for isNode

declare const global: any;

//quick fix for base64ToBinary

declare type Buffer = any; //hacky: this is used when compiling all packages with gulp, because it overwrites @node/Buffer
declare const Buffer: any;
declare const window: any;

//
// common types among node and web.
//

/**
 * @source lib.dom.d.ts
 */
interface Console {
  log(...data: any[]): void;
  error(...data: any[]): void;
}

declare let console: Console;

/**
 * @source: lib.dom.d.ts
 */
declare const clearInterval: (handle?: number) => void;
declare const clearTimeout: (handle?: number) => void;
declare const setInterval: (
  handler: string | (() => void),
  timeout?: number,
  ...arguments: any[]
) => number;
declare const setTimeout: (
  handler: string | (() => void),
  timeout?: number,
  ...arguments: any[]
) => number;

/**
 * @source: @types/node
 */
declare class TextDecoder {
  readonly encoding: string;
  readonly fatal: boolean;
  readonly ignoreBOM: boolean;
  constructor(
    encoding?: string,
    options?: { fatal?: boolean; ignoreBOM?: boolean }
  );
  decode(
    input?: ArrayBufferView | ArrayBuffer | null,
    options?: { stream?: boolean }
  ): string;
}
