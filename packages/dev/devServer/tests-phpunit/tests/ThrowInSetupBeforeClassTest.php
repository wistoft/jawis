<?php

use PHPUnit\Framework\TestCase;

final class ThrowInSetupBeforeClassTest extends TestCase
{
    
    public static function setUpBeforeClass(): void
    {
        throw new \Exception("in setup before class");
    }

    public function testIt(): void
    {
        unreach();
    }
}
