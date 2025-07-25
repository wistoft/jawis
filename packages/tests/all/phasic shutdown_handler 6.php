<?php

//doesn't work. Nothing is reported. Seems like shutdown handler isn't called.

//stack overflow

use wiph_dev\tests\_fixture\TestUtil;

TestUtil::setDevJagoErrorHandlers();

ini_set('memory_limit', memory_get_usage(true)); //to reduce the time to OOM

//
//this could be used as a fallback:
//  but then the problem of filtering errors, that are already reported.
//

// error_reporting(E_ERROR | E_COMPILE_ERROR);
// ini_set('display_errors', 0);
// ini_set('log_errors', 1);
// ini_set('error_log', __FILE__ . '.txt');

//
// the overflow
//

function func(){
  func();
}

func();