<?php

use wiph_dev\tests\_fixture\TestUtil;

TestUtil::setDevJagoErrorHandlers();

class Foo
{
    public static $prop = 24;
}
$obj = new Foo();
$obj->prop = 42;
