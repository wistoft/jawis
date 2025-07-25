<?php

use PHPUnit\Framework\TestCase;

//phpunit mangles the exception in: vendor\phpunit\phpunit\src\Framework\TestSuite.php:691
//  - error message is changed
//  - stack trace is truncated
//  - test is reported twice, even though it's only executed once.

final class ThrowInTearDownAfterClassTest extends TestCase
{
    
    public static function tearDownAfterClass(): void
    {
        helper();
    }

    public function testIt(): void
    {
        echo "in test \n";
    }
}

function helper (){
    throw new \Exception("in tear down after class");
}