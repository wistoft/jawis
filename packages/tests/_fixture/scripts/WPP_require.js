require("./hello");

//request will only result in one require message.
require("./helloTs.ts");
require("./helloTs.ts");
require("./helloTs.ts");

//native modules are also sent

require("fs");
require("fs");
require("fs");
