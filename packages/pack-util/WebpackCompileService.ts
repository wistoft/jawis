import path from "node:path";

import { CompileService, def } from "^jab";

import {
  Request,
  RequestBatcher,
  WebpackBatchCompiler,
  WebpackBatchCompilerDeps,
} from "./internal";

export type WebpackCompileServiceDeps = WebpackBatchCompilerDeps;

/**
 *
 * todo
 *  - webpack compiler foreach tsconfig.json
 */
export class WebpackCompileService implements CompileService {
  private compiler: WebpackBatchCompiler;
  private requestBatcher: RequestBatcher<string, string>;

  /**
   *
   */
  constructor(private deps: WebpackCompileServiceDeps) {
    this.compiler = new WebpackBatchCompiler(deps);

    this.requestBatcher = new RequestBatcher({
      onBatch: this.onBatch,
    });
  }

  /**
   *
   */
  public load = (absFile: string) => {
    if (!path.isAbsolute(absFile)) {
      throw new Error("File must be absolute: " + absFile);
    }

    return this.requestBatcher.request(absFile);
  };

  /**
   * can't this be generalized into RequestBatcher?
   */
  private onBatch = (requests: Request<string, string>[]) => {
    const absFiles = requests.map((elm) => elm.data);

    return this.compiler.loadMultiple(absFiles).then(
      (data) => {
        for (const request of requests) {
          try {
            const resp = data.find((datum) => datum.absFile === request.data);

            request.prom.resolve(def(resp).code);
          } catch (error) {
            //is there any way to guarantee, that it is either resolved xor rejected.
            request.prom.reject(error as any);
          }
        }
      },
      (error) => {
        //reject all, when webpack compiler throws
        for (const request of requests) {
          request.prom.reject(error);
        }
      }
    );
  };
}
