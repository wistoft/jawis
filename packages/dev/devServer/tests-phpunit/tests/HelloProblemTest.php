<?php

use PHPUnit\Framework\TestCase;

echo "pre test\n";

$printedInContructor = false;

final class HelloProblemTest extends TestCase
{

    public function __construct(?string $name = null, array $data = [], $dataName = ''){
        parent::__construct($name, $data, $dataName);

        global $printedInContructor;

        if (!$printedInContructor){
            $printedInContructor = true;
            echo "in contructor\n";
        }
    }

    public function testAssertFalse(): void
    {
        $this->assertEquals(
            [1, 2, 3],
            [1, 2, 3, 4],
        );
    }

    public function testThrow(): void
    {
        throw new \Exception("ups");
    }

    public function testIncomplete(): void
    {
        $this->markTestIncomplete(
            'incomplete test'
        );
    }

    public function testSkipped(): void
    {
        $this->markTestSkipped(
            'skipped'
        );
    }

    public function testOutput(): void
    {
        echo "I'm a rebel";
    }

    public function testOutputPostfix(): void
    {
        throw new \Exception("test with a name, that is a super-string of another must not interfere.");
    }

    public function testJagoOut(): void
    {
        out(["null" => null, "arr" => [1,2,3]]);
    }

    //
    // multi test
    //

    public static function additionProvider(): array
    {
        return [
            ["first test"],
            ["second test"]
        ];
    }

    /**
     * @dataProvider additionProvider
     */
    public function testDataProvider(string $str): void
    {
        out($str);
    }
}
