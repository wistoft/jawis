<?php

//error in exception handler

use wiph_dev\phasic\Jago;
use wiph_dev\tests\_fixture\TestUtil;

TestUtil::setDevJagoErrorHandlers();

//misconfiguration that cause handler to error.

Jago::$oldExceptionHandler = function (){
  "" . [];
};

//exception that makes the handler attempt to log something

throw new \Exception("original exception");
