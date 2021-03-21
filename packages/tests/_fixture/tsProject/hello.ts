import { returnSomething, saySomething } from "./library";

const something = "hej";

console.log(something as string);

saySomething();
console.log(returnSomething());
