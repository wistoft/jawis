<?php

use PHPUnit\Framework\TestCase;

final class ThrowInTearDownTest extends TestCase
{
    protected function tearDown(): void
    {
        throw new \Exception("in tear down");
    }

    public function testIt(): void
    {
        echo "in test\n";
    }
}
