<?php

use wiph_dev\tests\_fixture\TestUtil;

TestUtil::setDevJagoErrorHandlers();

function my_func()
{

    throw new \Exception("hej");

}

my_func();
