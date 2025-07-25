import { registerPrecompilers } from "^node-module-hooks-plus";

//double register

registerPrecompilers([".bla"], () => "");

try {
  registerPrecompilers([".bla"], () => "");
} catch (e: any) {
  console.log(e.toString());
}
