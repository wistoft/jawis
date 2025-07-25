<?php

//error in error handler

use wiph_dev\phasic\Jago;
use wiph_dev\tests\_fixture\TestUtil;

TestUtil::setDevJagoErrorHandlers();

//misconfiguration that cause handler to trigger new error.

Jago::$oldErrorHandler = function (){
  "" . [];
};

//error that makes the handler attempt to log something

$fido = $original_error;

echo "done"; //this is reached, because oldErrorHandler also cause script not to stop-on-error