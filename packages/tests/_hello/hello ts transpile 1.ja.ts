import { TestProvision } from "^jarun";
import * as ts from "typescript";

export default (prov: TestProvision) => {
  const source = `
  import * as ts from "typescript";
  import value from "library"
  
  export const x: string  = 'string'
X = ts
X = value
  console.log(x)
  `;

  const opt: ts.TranspileOptions = {
    compilerOptions: {
      esModuleInterop: false, //large effect.
      reportDiagnostics: true,
      // inlineSourceMap: true,
    },
  };

  const result = ts.transpileModule(source, opt);

  prov.imp(result);

  //gives no
  prov.imp(ts.transpileModule(`"`, opt));
};
//
//
//
//
