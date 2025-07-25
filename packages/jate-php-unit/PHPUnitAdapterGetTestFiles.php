<?php

// This file must have the work dir set to a folder, where phpunit is installed.

$workDir = getcwd();

require_once $workDir . "/vendor/autoload.php";

use PHPUnit\Framework\TestSuite;
use PHPUnit\TextUI\Command;

use wiph_dev\phasic\Jago;
use wiph_dev\phasic\ErrorUtil;

/**
 * traverse the test suite to find information
 *
 * related to: `PHPUnit\Util\TextTestListRenderer`
 */
function traverseTestSuite($testSuite)
{
    $refl = new ReflectionClass($testSuite);

    if ($refl->hasProperty('testCase')) {
        foreach ($testSuite->tests() as $ts) {
            traverseTestSuite($ts);
        }
    } else {
        //it's a specific test case
        
        //test for ErrorTestCase

        //ErrorTestCase when dataProvider throws
        //WarningTestCase when test class has no methods
        if (    $testSuite instanceof \PHPUnit\Framework\ErrorTestCase
            ||  $testSuite instanceof \PHPUnit\Framework\WarningTestCase
            ){
            Jago::jago_send_error(new \Exception($testSuite->getMessage()));
            return;
        }
        
        //it should work

        $testClass = new ReflectionClass($testSuite);

        $testName = $testSuite->getName(); //testName might include a dataProvider id.
        $methodName = $testSuite->getName(false);

        $testMethod = $testClass->getMethod($methodName);

        $name = $testClass->getName() . "::" . $testName;
        $line = $testMethod->getStartLine();

        Jago::jago_send_message_via_stdio([
            "id" => $name,
            "name" => $name,
            "file" => $refl->getFileName(),
            "line" => $line
        ]);
    }
}

//
// phpunit 8
//

// $configuration = Configuration::getInstance($workDir . '/phpunit.xml');
// $testSuite = $configuration->getTestSuiteConfiguration();

// traverseTestSuite($testSuite);

//
// phpunit 9
//

class MonkeyCommand extends Command
{

    /**
     * Adapted from: `PHPUnit\TextUI\Command->run`
     */
    public function doit()
    {
        $this->handleArguments([]);

        if ($this->arguments['test'] instanceof TestSuite) {
            $suite = $this->arguments['test'];
        } else {
            $runner = $this->createRunner();

            $suite = $runner->getTest(
                $this->arguments['test'],
                $this->arguments['testSuffixes']
            );
        }

        traverseTestSuite($suite);
    }

}

(new MonkeyCommand())->doit();
