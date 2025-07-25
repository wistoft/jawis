<?php

//exception in destructor

use wiph_dev\tests\_fixture\TestUtil;

TestUtil::setDevJagoErrorHandlers();

class X
{
  public $y;//so x must be destructed first

  function __destruct()
  {
    echo "destruct X\n";
    
    throw new \Exception("ups");
  }
};

class Y
{
  function __destruct()
  {
    echo "destruct Y\n";
  }
};

$y = new Y();
$x = new X();
$x->y = $y;
