<?php

require_once("vendor/autoload.php");
require_once("PHPUnitAdapterRunTestCommand.php");
require_once("PHPUnitAdapterTestListener.php");
require_once("PHPUnitAdapterUtil.php");


try{
    
    (new RunTestCommand())->doit();

} catch (\Throwable $error) {

    //fragile because this will squash the caught error if exception is thrown.
    sendEmptyResultIfNothingHasBeenSent();

    throw $error;
}