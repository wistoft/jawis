<?php

use wiph_dev\tests\_fixture\TestUtil;

TestUtil::setDevJagoErrorHandlers();

class Foo
{
    public function method()
    {}
}

Foo::method();
