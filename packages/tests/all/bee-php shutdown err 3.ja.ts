import { TestProvision } from "^jarun";
import { getScriptPath, makePhpBee_test, makeTempFile } from "../_fixture";

//fatal error 2 with unflushed output buffer

export default (prov: TestProvision) =>
  makePhpBee_test(prov, {
    def: {
      filename: makeTempFile(`<?php

//it's called manually in shutdown
ob_start(function ($str) {
  //is also outputted in case of exception
  echo "hej";

  //reported nicely, shutdown flushes.
  throw new \\Exception("ups in mapper");
});

echo "ordinary";

//make fatal error

require "${__dirname}/../_fixture/scripts/parse-error-class.php";
`),
    },
  });
