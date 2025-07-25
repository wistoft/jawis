<?php

use PHPUnit\Framework\TestCase;

final class ThrowInAssertPreTest extends TestCase
{
    protected function assertPreConditions(): void
    {
        echo "hej";
        
        throw new \Exception("in assert before");
    }

    public function testIt(): void
    {
        unreach();
    }
}
