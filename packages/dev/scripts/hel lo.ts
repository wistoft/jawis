import StackTrace from "stack-trace";
import { base64ToBinary, binaryToBase64, JabError } from "^jab";
import { assert } from "@wistoft/jab";
import { parseNodeTrace } from "^jawis-util/web";

const stack =
  "Error: something went wrong\n    at E:\\work\\repos\\jawis\\packages\\dev\\scripts\\hel lo.ts:7:13\n    at Object.<anonymous> (E:\\work\\repos\\jawis\\packages\\dev\\scripts\\hel lo.ts:53:3)\n    at Module._compile (internal/modules/cjs/loader.js:1158:30)\n    at Module._compile (E:\\work\\repos\\jawis\\node_modules\\source-map-support\\source-map-support.js:547:25)\n    at Object.<anonymous> (E:\\work\\repos\\jawis\\node_modules\\@wistoft\\jacs\\compiled\\webpack:\\packages\\jab-node\\node-module-util.ts:159:19)\n    at Module.load (internal/modules/cjs/loader.js:1002:32)\n    at Function._originalLoad (internal/modules/cjs/loader.js:901:14)\n    at Function.requireSender [as _load] (E:\\work\\repos\\jawis\\node_modules\\@wistoft\\jagos\\compiled\\webpack:\\packages\\jab-node\\process\\util.ts:69:31)\n    at Module.require (internal/modules/cjs/loader.js:1044:19)\n    at require (internal/modules/cjs/helpers.js:77:18)";

console.log(parseNodeTrace(stack));

// (() => {
//   //note parse can't be call alone, it must have 'this === StackTrace'
//   var trace = StackTrace.parse({ stack } as any);

//   console.log(stack);
//   // console.log(trace);
//   const res = trace.map((frame) => {
//     // compose

//     let composedFunc;

//     if (frame.getTypeName() !== null) {
//       if (frame.getMethodName() !== null) {
//         composedFunc = frame.getTypeName() + "." + frame.getMethodName();
//       } else {
//         composedFunc = frame.getTypeName() + ".<anonymous>";
//       }
//     } else {
//       if (frame.getMethodName() !== null) {
//         composedFunc = frame.getMethodName();
//       } else {
//         composedFunc = "";
//       }
//     }

//     //check

//     let func = frame.getFunctionName();

//     if (func === null) {
//       func = composedFunc;
//     } else {
//       assert(composedFunc === "" || func === composedFunc, undefined, {
//         frame,
//         func,
//         composedFunc,
//       });
//     }

//     return {
//       line: frame.getLineNumber(),
//       file: frame.getFileName(),
//       func,
//     };
//   });

//   console.log(res);
// })();
