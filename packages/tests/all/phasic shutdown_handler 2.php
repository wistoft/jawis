<?php

//unflushed output buffer mapper

use wiph_dev\tests\_fixture\TestUtil;

TestUtil::setDevJagoErrorHandlers();

ob_start(function () {
  echo "in ob mapper";

  throw new \Exception('ups mapper');
});

ob_start(); //multiple buffering must be handled.

echo "ordinary-stdout\n";