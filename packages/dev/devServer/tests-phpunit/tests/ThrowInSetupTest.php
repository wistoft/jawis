<?php

use PHPUnit\Framework\TestCase;

final class ThrowInSetupTest extends TestCase
{
    protected function setUp(): void
    {
        throw new \Exception("in setup");
    }

    public function testIt(): void
    {
        unreach();
    }
}