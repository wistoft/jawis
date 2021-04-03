import { unRegisterTsCompiler } from "^jacs";
import { registerPrecompilers } from "^jab-node";

//double register

unRegisterTsCompiler();

registerPrecompilers([".ts"], () => "");

try {
  registerPrecompilers([".ts"], () => "");
} catch (e) {
  console.log(e.toString());
}
