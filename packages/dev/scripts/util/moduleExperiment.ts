/* eslint-disable unused-imports/no-unused-vars */
import {
  interceptResolve,
  plugIntoModuleLoad,
  registerExtensions,
} from "^node-module-hooks-plus";
import { makeMakeCachedResolve, makeSharedResolveMap } from "^cached-resolve";

import { makeMeasure } from "./index";

/**
 *
 */
export const makeExpriment = (deps: { cacheResolve: boolean }) => {
  const { measure, getResult } = makeMeasure();

  //load

  plugIntoModuleLoad(
    (original) => (request, parent, isMain) =>
      measure(() => original(request, parent, isMain), {
        type: "all",
        request: request + "\n",
      })
  );

  //resolve

  interceptResolve((original) => {
    const handler = deps.cacheResolve
      ? makeMakeCachedResolve(makeSharedResolveMap())(original)
      : original;

    return (request, parent, isMain) =>
      measure(
        () => {
          return handler(request, parent, isMain);
        },
        {
          type: "resolve",
          request,
        }
      );
  });

  //load & compile

  registerExtensions(
    [".js", ".ts", ".tsx"],
    (originalExtension) => (module, filename) => {
      if (!originalExtension) {
        throw new Error("original must be defined");
      }

      const originalCompile = module._compile.bind(module);

      module._compile = (...args) =>
        measure(() => originalCompile(...args), { type: "compile", filename });

      return measure(() => originalExtension(module, filename), {
        type: "load",
        filename,
      });
    },
    true
  );

  const printResultCounts = () => {
    console.log("counts\n");
    const measureResult = getResult();

    const count: any = {};

    for (const mes of measureResult) {
      //count

      if (count[mes.type] === undefined) {
        count[mes.type] = 0;
      }

      count[mes.type] += 1;
    }

    for (const key in count) {
      console.log(key + ": ", count[key]);
    }
  };

  const printResult = () => {
    console.log("\ntime");

    const measureResult = getResult();

    // const count: any = {};
    const agg: any = {};
    const hist: any = {};
    let total = BigInt(0);

    for (const mes of measureResult) {
      //time

      if (agg[mes.type] === undefined) {
        agg[mes.type] = BigInt(0);
      }

      agg[mes.type] += mes.ownNs;

      //hist

      if (hist[Number(mes.ownNs / BigInt(1000 * 1000))] === undefined) {
        hist[Number(mes.ownNs / BigInt(1000 * 1000))] = 0;
      }

      hist[Number(mes.ownNs / BigInt(1000 * 1000))] += 1;
      total += mes.ownNs;

      // if (mes.ownNs < -10000000) {
      //   console.log(mes);
      // }

      // if (
      //   mes.filename ===
      //   "E:\\work\\repos\\jawis\\packages\\tests\\_fixture\\index.ts"
      // ) {
      //   console.log(mes);
      // }
    }

    // for (let key in count) {
    //   console.log(key + ": ", count[key]);
    // }

    // for (const key in count) {
    //   console.log(key + ": ", count[key]);
    // }

    console.log("");

    for (const key in agg) {
      console.log(key + ": ", Number(agg[key] / BigInt(1000 * 1000)) + "ms");
    }

    console.log("");
    console.log(hist);

    // let histTotal = 0;
    // for (const key in hist) {
    //   histTotal += (key as any) * hist[key];
    // }

    // console.log({ total: total / BigInt(1000 * 1000), histTotal });

    // for (const mes of measureResult) {
    //   const info = "filename" in mes ? mes.filename : mes.request;

    //   console.log(
    //     // mes.nestLevel +
    //     //   " " +
    //     "\t".repeat(mes.nestLevel) +
    //       mes.type +
    //       // " " +
    //       // mes.ns / BigInt(1000 * 1000) +
    //       " " +
    //       mes.ownNs / BigInt(1000 * 1000) +
    //       " " +
    //       info
    //   );
    // }

    // // console.log(messureResult);
  };

  return { measure, getResult, printResult, printResultCounts };
};
