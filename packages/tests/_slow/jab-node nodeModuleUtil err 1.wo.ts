import { unRegisterTsCompiler } from "^jacs";
import { registerPrecompiler } from "^jab-node";

//double register

unRegisterTsCompiler();

registerPrecompiler([".ts"], () => "");

try {
  registerPrecompiler([".ts"], () => "");
} catch (e) {
  console.log(e.toString());
}
