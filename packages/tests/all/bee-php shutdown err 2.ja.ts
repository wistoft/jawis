import { TestProvision } from "^jarun";
import { getScriptPath, makePhpBee_test, makeTempFile } from "../_fixture";

//exception in destructor

export default (prov: TestProvision) =>
  makePhpBee_test(prov, {
    def: {
      filename: makeTempFile(`<?php

class X
{
  public $y;//so x must be destructed first

  function __destruct()
  {
    echo "destruct X\\n";
    
    throw new \\Exception("ups");
  }
};

class Y
{
  function __destruct()
  {
    echo "destruct Y\\n";
  }
};

$y = new Y();
$x = new X();
$x->y = $y;
`),
    },
  });
