<?php

//exception in error handler

use wiph_dev\tests\_fixture\TestUtil;
use wiph_dev\phasic\Jago;

TestUtil::setDevJagoErrorHandlers();

//misconfiguration that cause handler to throw.

Jago::$oldErrorHandler = function (){
  throw new \Exception("some exception");
};

//error that makes the handler attempt to log something

${"var1"}["prop"];

