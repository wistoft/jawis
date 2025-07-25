<?php

use PHPUnit\Framework\AssertionFailedError;
use PHPUnit\Framework\Test;
use PHPUnit\Framework\TestListener;
use PHPUnit\Framework\TestResult;
use PHPUnit\Framework\TestSuite;
use PHPUnit\Framework\Warning;
use PHPUnit\TextUI\ResultPrinter;

use wiph_dev\phasic\Jago;
use wiph_dev\phasic\ErrorUtil;

/**
 *
 */
class PHPUnitAdapterTestListener implements TestListener, ResultPrinter
{
    private $checkLog = [];

    public function addError(Test $test, Throwable $e, float $time): void
    {
        Jago::jago_send_error($e);
    }

    public function addWarning(Test $test, Warning $e, float $time): void
    {
        Jago::jago_send_error($e);
    }

    public function addFailure(Test $test, AssertionFailedError $e, float $time): void
    {
        if ($e instanceof \PHPUnit\Framework\ExpectationFailedException){
            $failure = $e->getComparisonFailure();

            if ($failure){
                $this->checkLog[] = getCheckLog($e, $failure);
                return;
            }
        }

        Jago::jago_send_error($e);
    }

    public function endTest(Test $test, float $time): void
    {
        if ($test->hasOutput()) {
            Jago::logStream("stdout", $test->getActualOutput());
        }

        $res = [
            "cur" => [
              "user" => new \stdClass()
            ]
        ];

        if (count($this->checkLog) !== 0){
            if (count($this->checkLog) !== 1){
                throw new \Exception("Only one assertation supported");
            }

            $res["cur"]["chk"] = $this->checkLog[0];
        }
        
        sendTestResult($res);
    }

    //don't know want to do with this.
    public function addIncompleteTest(Test $test, Throwable $t, float $time): void {}

    //ignoring this. It's called on output, and if no assertations are called.
    public function addRiskyTest(Test $test, Throwable $t, float $time): void {}

    //don't know want to do with this.
    public function addSkippedTest(Test $test, Throwable $t, float $time): void {}

    
    public function startTestSuite(TestSuite $suite): void {}
    public function endTestSuite(TestSuite $suite): void {}
    public function startTest(Test $test): void {}
    public function printResult(TestResult $result): void {}
    public function write(string $buffer): void {}
}

