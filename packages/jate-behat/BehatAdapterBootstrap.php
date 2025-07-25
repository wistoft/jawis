<?php

require_once("vendor/autoload.php");
require_once("BehatAdapterExtension.php");
require_once("BehatAdapterFormatter.php");
require_once("BehatAdapterPrinter.php");
require_once("BehatAdapterUtil.php");

try{
  
  // taken from behat booter: vendor/behat/behat/bin/behat
  
  
  $factory = new \Behat\Behat\ApplicationFactory();
  $app = $factory->createApplication();
  $app->setCatchExceptions(false);
  $app->run();

} catch (\Throwable $error) {
  //fragile because this will squash the caught error if exception is thrown.
  \jate_bahat\sendEmptyResultIfNothingHasBeenSent();
  
  throw $error;
}