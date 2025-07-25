<?php

use wiph_dev\tests\_fixture\TestUtil;

TestUtil::setDevJagoErrorHandlers();

class Fido
{
    public static function ups()
    {
        throw new \Exception("ups");
    }
}

Fido::ups();

echo "after";
