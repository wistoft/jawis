import async_hooks from "async_hooks";
import { enable, unknownToErrorData } from "^jab";
import { filterStackTrace } from "^tests/_fixture";

//getting without nesting

enable(async_hooks);

console.log(filterStackTrace(unknownToErrorData(new Error())));
