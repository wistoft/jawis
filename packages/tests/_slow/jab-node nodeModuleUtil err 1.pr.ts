import { unRegisterTsCompiler } from "^jacs";
import { registerPrecompiler } from "^jab-node";

unRegisterTsCompiler();

//double register

registerPrecompiler([".ts"], () => "");

try {
  registerPrecompiler([".ts"], () => "");
} catch (e) {
  console.log(e.toString());
}
