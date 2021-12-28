import { registerPrecompilers } from "^jab-node";

//double register

registerPrecompilers([".bla"], () => "");

try {
  registerPrecompilers([".bla"], () => "");
} catch (e: any) {
  console.log(e.toString());
}
