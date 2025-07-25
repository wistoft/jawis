import { TestProvision } from "^jarun";

import { stdioInterpreter_for_test } from "^tests/_fixture";

//single input to the parser

export default (prov: TestProvision) => {
  prov.eq([], stdioInterpreter_for_test([]));
  prov.eq([], stdioInterpreter_for_test([""]));

  prov.log("hej", stdioInterpreter_for_test(["hej"]));
  prov.log("LF", stdioInterpreter_for_test(["\n"]));
  prov.log("LF hej", stdioInterpreter_for_test(["\nhej"]));
  prov.log("hej LF", stdioInterpreter_for_test(["hej\n"]));
  prov.log("hej LF dav", stdioInterpreter_for_test(["hej\ndav"]));
  prov.log("LF LF", stdioInterpreter_for_test(["\n\n"]));
  prov.log("LF LF dav", stdioInterpreter_for_test(["\n\ndav"]));
  prov.log("LF hej LF", stdioInterpreter_for_test(["\nhej\n"]));
  prov.log("LF hej LF dav", stdioInterpreter_for_test(["\nhej\ndav"]));
  prov.log("hi LF LF", stdioInterpreter_for_test(["hi\n\n"]));
  prov.log("hi LF LF dav", stdioInterpreter_for_test(["hi\n\ndav"]));
  prov.log("hi LF hej LF", stdioInterpreter_for_test(["hi\nhej\n"]));
  prov.log("hi LF hej LF dav", stdioInterpreter_for_test(["hi\nhej\ndav"]));
};
