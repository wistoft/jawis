<?php

use PHPUnit\Framework\TestCase;

final class ThrowInAssertPostTest extends TestCase
{
    protected function assertPostConditions(): void
    {
        echo "hej";

        throw new \Exception("in assert after");
    }

    public function testIt(): void
    {
        echo "in test\n";
    }
}
