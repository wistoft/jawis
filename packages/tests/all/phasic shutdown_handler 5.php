<?php

//fatal error 2 with unflushed output buffer

use wiph_dev\tests\_fixture\TestUtil;

TestUtil::setDevJagoErrorHandlers();

//it's called manually in shutdown
ob_start(function ($str) {
  //is also outputted in case of exception
  echo "hej";

  //reported nicely, shutdown flushes.
  throw new \Exception("ups in mapper");
});

echo "ordinary";

//make fatal error

require __DIR__ . "/../_fixture/scripts/parse-error-class.php";