<?php

use PHPUnit\Framework\TestSuite;
use PHPUnit\TextUI\Command;

class RunTestCommand extends Command
{

    /**
     * Adaptation of: `PHPUnit\TextUI\Command->run`
     * 
     */
    public function doit($exit = true)
    {
        $this->handleArguments($_SERVER['argv']);

        $runner = $this->createRunner();

        if ($this->arguments['test'] instanceof TestSuite) {
            $suite = $this->arguments['test'];
        } else {
            $suite = $runner->getTest(
                $this->arguments['test'],
                $this->arguments['testSuffixes']
            );
        }

        unset($this->arguments['test'], $this->arguments['testFile']);

        //the important thing is this line isn't in try-catch.
        $runner->run($suite, $this->arguments, [], $exit);
        
    }

}

