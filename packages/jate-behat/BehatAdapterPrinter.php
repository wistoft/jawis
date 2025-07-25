<?php

namespace jate_bahat;

use Behat\Testwork\Output\Printer\OutputPrinter;


/**
 * Must exist, because called by: OutputManager->setFormatterParameter
 */
class Printer implements OutputPrinter {

  public function __construct(){

  }

  public function setOutputPath($outpath){}

  public function getOutputPath(){
    return null;
  }

  public function setOutputStyles(array $styles){}

  public function getOutputStyles(){}

  public function setOutputDecorated($decorated){}

  public function isOutputDecorated(){
    return true;
  }

  public function setOutputVerbosity($level){}

  public function getOutputVerbosity(){
    return 0;
  }

  public function write($messages, $append = false){}

  public function writeln($messages = ''){}

  public function flush(){}
}